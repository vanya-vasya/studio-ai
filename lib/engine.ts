import { and, asc, eq, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import OpenAI, { toFile } from "openai";
import { db, runFiles, runs } from "@/lib/db";
import { debitCredits, getBalance, refundCredits } from "@/lib/credits";
import { hashRunInputs } from "@/lib/hash";
import {
  OPENAI_VOICES,
  sizeForFormat,
  type ToolConfig,
  type ToolParams,
} from "@/lib/registry";

const runId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

const openai = new OpenAI();

const IMAGE_QUALITY = (process.env.IMAGE_QUALITY ?? "low") as
  | "low"
  | "medium"
  | "high";

export type RunFile = { id: string; name: string; mime: string; bytes: Buffer };

export type RunEvent =
  | { type: "started"; runId: string; cost: number; balance: number }
  | { type: "cached"; runId: string }
  | { type: "partial"; frame: number; dataUrl: string }
  | { type: "frame"; frame: number; url: string }
  | { type: "textDelta"; delta: string }
  | { type: "text"; content: string }
  | { type: "audio"; url: string }
  | { type: "done"; runId: string; balance: number }
  | {
      type: "error";
      message: string;
      refunded: boolean;
      balance: number;
    };

export type EmitFn = (event: RunEvent) => void;

const fileUrl = (id: string, filename: string) => `/api/file/${id}/${filename}`;

const storeFile = async (
  id: string,
  index: number,
  filename: string,
  mime: string,
  data: Buffer,
  dims?: { width: number; height: number },
) => {
  // hex + decode() keeps bytea round-trips driver-agnostic over Neon HTTP
  await db.execute(sql`
    insert into run_files (run_id, index, filename, mime, bytes, width, height, data)
    values (${id}, ${index}, ${filename}, ${mime}, ${data.length},
            ${dims?.width ?? null}, ${dims?.height ?? null},
            decode(${data.toString("hex")}, 'hex'))
    on conflict (run_id, filename) do nothing
  `);
};

const pickSize = (tool: ToolConfig, params: ToolParams, hasImageInput: boolean) => {
  const hasFormatControl = tool.controls.some(
    (control) => control.kind === "select" && control.id === "format",
  );
  if (hasFormatControl) return sizeForFormat(params.format, tool.size ?? "1024x1024");
  if (tool.slug === "photo-studio") return "1024x1536" as const;
  if (hasImageInput) return "auto" as const;
  return tool.size ?? ("1024x1024" as const);
};

const generationInput = (params: ToolParams, files: RunFile[]) => {
  const images = files.filter(
    (file) => file.id !== "mask" && file.mime.startsWith("image/"),
  );
  const mask = files.find((file) => file.id === "mask");
  return { images, mask, prompt: params };
};

const toOpenAIFiles = async (files: RunFile[]) =>
  Promise.all(
    files.map((file) =>
      toFile(file.bytes, file.name || `${file.id}.png`, { type: file.mime }),
    ),
  );

const dimsFor = (size: string): { width: number; height: number } | undefined => {
  const [w, h] = size.split("x").map(Number);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return undefined;
  return { width: w, height: h };
};

/** One gpt-image-1 call (generate or edit), streaming partial previews. */
const generateOneImage = async (opts: {
  prompt: string;
  size: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
  images: RunFile[];
  mask?: RunFile;
  signal: AbortSignal;
  onPartial?: (dataUrl: string) => void;
}): Promise<Buffer> => {
  const { prompt, size, images, mask, signal, onPartial } = opts;
  const stream = onPartial !== undefined;

  if (images.length > 0) {
    const inputFiles = await toOpenAIFiles(images);
    const maskFile = mask
      ? await toFile(mask.bytes, "mask.png", { type: "image/png" })
      : undefined;
    if (stream) {
      const events = await openai.images.edit(
        {
          model: "gpt-image-1",
          image: inputFiles.length === 1 ? inputFiles[0] : inputFiles,
          ...(maskFile ? { mask: maskFile } : {}),
          prompt,
          size,
          quality: IMAGE_QUALITY,
          stream: true,
          partial_images: 2,
        },
        { signal },
      );
      let final: string | undefined;
      for await (const event of events) {
        if (event.type === "image_edit.partial_image" && event.b64_json) {
          onPartial?.(`data:image/png;base64,${event.b64_json}`);
        }
        if (event.type === "image_edit.completed" && event.b64_json) {
          final = event.b64_json;
        }
      }
      if (!final) throw new Error("The model returned no image");
      return Buffer.from(final, "base64");
    }
    const result = await openai.images.edit(
      {
        model: "gpt-image-1",
        image: inputFiles.length === 1 ? inputFiles[0] : inputFiles,
        ...(maskFile ? { mask: maskFile } : {}),
        prompt,
        size,
        quality: IMAGE_QUALITY,
      },
      { signal },
    );
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("The model returned no image");
    return Buffer.from(b64, "base64");
  }

  if (stream) {
    const events = await openai.images.generate(
      {
        model: "gpt-image-1",
        prompt,
        size: size === "auto" ? "1024x1024" : size,
        quality: IMAGE_QUALITY,
        stream: true,
        partial_images: 2,
      },
      { signal },
    );
    let final: string | undefined;
    for await (const event of events) {
      if (event.type === "image_generation.partial_image" && event.b64_json) {
        onPartial?.(`data:image/png;base64,${event.b64_json}`);
      }
      if (event.type === "image_generation.completed" && event.b64_json) {
        final = event.b64_json;
      }
    }
    if (!final) throw new Error("The model returned no image");
    return Buffer.from(final, "base64");
  }

  const result = await openai.images.generate(
    {
      model: "gpt-image-1",
      prompt,
      size: size === "auto" ? "1024x1024" : size,
      quality: IMAGE_QUALITY,
    },
    { signal },
  );
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("The model returned no image");
  return Buffer.from(b64, "base64");
};

const replayRun = async (id: string, emit: EmitFn, balance: number) => {
  const [run] = await db.select().from(runs).where(eq(runs.id, id));
  if (!run) return;
  emit({ type: "cached", runId: id });
  emit({ type: "started", runId: id, cost: 0, balance });
  if (run.outputKind === "text" && run.textOutput) {
    emit({ type: "text", content: run.textOutput });
  } else {
    const files = await db
      .select({ filename: runFiles.filename, index: runFiles.index })
      .from(runFiles)
      .where(eq(runFiles.runId, id))
      .orderBy(asc(runFiles.index));
    for (const file of files) {
      if (run.outputKind === "audio") {
        emit({ type: "audio", url: fileUrl(id, file.filename) });
      } else {
        emit({ type: "frame", frame: file.index, url: fileUrl(id, file.filename) });
      }
    }
  }
  emit({ type: "done", runId: id, balance });
};

export const executeRun = async (opts: {
  userId: string;
  tool: ToolConfig;
  params: ToolParams;
  files: RunFile[];
  signal: AbortSignal;
  emit: EmitFn;
}): Promise<void> => {
  const { userId, tool, params, files, signal, emit } = opts;

  const inputHash = hashRunInputs(
    tool.slug,
    params,
    files.map((file) => ({ id: file.id, bytes: file.bytes })),
  );

  // Free rerun on byte-identical inputs
  const [cached] = await db
    .select({ id: runs.id })
    .from(runs)
    .where(
      and(
        eq(runs.userId, userId),
        eq(runs.inputHash, inputHash),
        eq(runs.toolSlug, tool.slug),
        eq(runs.status, "done"),
      ),
    )
    .limit(1);
  if (cached) {
    const balance = await getBalance(userId);
    await replayRun(cached.id, emit, balance);
    return;
  }

  const id = runId();
  const balance = await debitCredits(userId, tool.price, id); // throws "insufficient"

  await db.insert(runs).values({
    id,
    userId,
    toolSlug: tool.slug,
    lookSlug: tool.slug === "photo-studio" ? (params.look ?? null) : null,
    params,
    cost: tool.price,
    status: "running",
    outputKind: tool.output.kind,
    inputHash,
  });

  emit({ type: "started", runId: id, cost: tool.price, balance });

  const finish = async (status: "done" | "failed" | "cancelled", text?: string) => {
    await db
      .update(runs)
      .set({ status, finishedAt: new Date(), ...(text ? { textOutput: text } : {}) })
      .where(eq(runs.id, id));
  };

  try {
    if (signal.aborted) throw new Error("cancelled");
    const prompt = tool.systemPrompt(params);

    if (tool.output.kind === "image") {
      const { images, mask } = generationInput(params, files);
      const size = pickSize(tool, params, images.length > 0);
      const frames = tool.output.frames ?? 1;

      if (frames > 1) {
        // Photo Studio: parallel frames, each streamed to the client as it lands
        await Promise.all(
          Array.from({ length: frames }, async (_, frame) => {
            const buffer = await generateOneImage({
              prompt,
              size,
              images,
              mask,
              signal,
            });
            const filename = `out-${frame}.png`;
            await storeFile(
              id,
              frame,
              filename,
              "image/png",
              buffer,
              size === "auto" ? undefined : dimsFor(size),
            );
            emit({ type: "frame", frame, url: fileUrl(id, filename) });
          }),
        );
      } else {
        const buffer = await generateOneImage({
          prompt,
          size,
          images,
          mask,
          signal,
          onPartial: (dataUrl) => emit({ type: "partial", frame: 0, dataUrl }),
        });
        await storeFile(
          id,
          0,
          "out-0.png",
          "image/png",
          buffer,
          size === "auto" ? undefined : dimsFor(size),
        );
        emit({ type: "frame", frame: 0, url: fileUrl(id, "out-0.png") });
      }
      await finish("done");
    }

    if (tool.output.kind === "text") {
      let content: string;
      if (tool.slug === "transcribe") {
        const audio = files.find((file) => file.id === "audio");
        if (!audio) throw new Error("No audio file uploaded");
        const transcription = await openai.audio.transcriptions.create(
          {
            model: "gpt-4o-transcribe",
            file: await toFile(audio.bytes, audio.name || "audio.mp3", {
              type: audio.mime,
            }),
            ...(params.context ? { prompt: params.context } : {}),
          },
          { signal },
        );
        content = transcription.text;
        emit({ type: "text", content });
      } else {
        const image = files.find((file) => file.mime.startsWith("image/"));
        const userContent: Array<
          | { type: "text"; text: string }
          | { type: "image_url"; image_url: { url: string } }
        > = [{ type: "text", text: prompt }];
        if (image) {
          userContent.push({
            type: "image_url",
            image_url: {
              url: `data:${image.mime};base64,${image.bytes.toString("base64")}`,
            },
          });
        }
        const stream = await openai.chat.completions.create(
          {
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: userContent }],
            stream: true,
          },
          { signal },
        );
        let text = "";
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            text += delta;
            emit({ type: "textDelta", delta });
          }
        }
        content = text.trim();
        emit({ type: "text", content });
      }
      await finish("done", content);
    }

    if (tool.output.kind === "audio") {
      if (!params.text?.trim()) throw new Error("No text to voice");
      const voice = OPENAI_VOICES[params.voice ?? ""] ?? "coral";
      const speech = await openai.audio.speech.create(
        {
          model: "gpt-4o-mini-tts",
          voice,
          input: params.text,
          instructions: prompt,
          response_format: "mp3",
        },
        { signal },
      );
      const buffer = Buffer.from(await speech.arrayBuffer());
      await storeFile(id, 0, "out.mp3", "audio/mpeg", buffer);
      emit({ type: "audio", url: fileUrl(id, "out.mp3") });
      await finish("done");
    }

    emit({ type: "done", runId: id, balance: await getBalance(userId) });
  } catch (error) {
    const cancelled =
      signal.aborted ||
      (error instanceof Error &&
        (error.name === "AbortError" || error.message === "cancelled"));
    await finish(cancelled ? "cancelled" : "failed");
    const newBalance = await refundCredits(userId, tool.price, id);
    const message = cancelled
      ? "Run cancelled — credits returned"
      : error instanceof Error
        ? error.message
        : "Generation failed";
    emit({ type: "error", message, refunded: true, balance: newBalance });
  }
};
