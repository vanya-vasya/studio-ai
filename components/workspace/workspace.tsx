"use client";

import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Share2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BrushMask } from "@/components/workspace/brush-mask";
import { FileDrop } from "@/components/workspace/file-drop";
import { LookPicker } from "@/components/workspace/look-picker";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getLook } from "@/lib/looks";
import type { Control, FileInput, ToolConfig } from "@/lib/registry";

export type ClientTool = Omit<ToolConfig, "systemPrompt">;

type Phase = "idle" | "running" | "done" | "error";

type FrameState = { partial?: string; url?: string };

const initialParams = (controls: Control[]): Record<string, string> => {
  const params: Record<string, string> = {};
  for (const control of controls) {
    if (control.kind === "select") {
      params[control.id] = control.defaultValue ?? control.options[0];
    } else if (control.kind === "switch") {
      params[control.id] = control.defaultOn ? "true" : "false";
    } else if (control.kind === "text" || control.kind === "textarea") {
      params[control.id] = "";
    } else if (control.kind === "lookPicker") {
      params[control.id] = "";
    }
  }
  return params;
};

export const Workspace = ({
  tool,
  initialBalance,
}: {
  tool: ClientTool;
  initialBalance: number;
}) => {
  const frameCount = tool.output.frames ?? 1;
  const isStudio = tool.slug === "photo-studio";
  const hasBrush = tool.controls.some((control) => control.kind === "brushMask");

  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [params, setParams] = useState(() => initialParams(tool.controls));
  const [mask, setMask] = useState<Blob | null>(null);
  const [balance, setBalance] = useState(initialBalance);
  const [phase, setPhase] = useState<Phase>("idle");
  const [frames, setFrames] = useState<FrameState[]>([]);
  const [textOut, setTextOut] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [shared, setShared] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (phase !== "running") return;
    const startedAt = Date.now();
    const interval = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt) / 1000)),
      1000,
    );
    return () => clearInterval(interval);
  }, [phase]);

  const setParam = useCallback((id: string, value: string) => {
    setParams((prev) => ({ ...prev, [id]: value }));
  }, []);

  const missingHint = useMemo((): string | null => {
    for (const input of tool.inputs) {
      if (input.required && !files[input.id]) {
        return `Upload: ${input.label.toLowerCase()}`;
      }
    }
    for (const control of tool.controls) {
      if (control.kind === "lookPicker" && !params[control.id]) {
        return "Pick a look";
      }
      if (control.kind === "brushMask" && files.photo && !mask) {
        return `To do: ${control.label.toLowerCase()}`;
      }
      if (
        (control.kind === "text" || control.kind === "textarea") &&
        !control.optional &&
        !params[control.id]?.trim()
      ) {
        return `Fill in '${control.label}'`;
      }
    }
    return null;
  }, [tool, files, params, mask]);

  const insufficient = balance < tool.price;
  const running = phase === "running";

  const handleRun = useCallback(async () => {
    if (missingHint || insufficient || running) return;
    setPhase("running");
    setElapsed(0);
    setShared(false);
    setErrorMessage(null);
    setTextOut("");
    setAudioUrl(null);
    setRunId(null);
    setFrames(Array.from({ length: frameCount }, () => ({})));

    const controller = new AbortController();
    abortRef.current = controller;

    const form = new FormData();
    form.set("tool", tool.slug);
    form.set("params", JSON.stringify(params));
    for (const [id, file] of Object.entries(files)) {
      if (file) form.append(id, file);
    }
    if (mask) {
      form.append("mask", new File([mask], "mask.png", { type: "image/png" }));
    }

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({ error: "Run failed" }));
        throw new Error(data.error ?? "Run failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handleEvent = (event: Record<string, unknown>) => {
        switch (event.type) {
          case "started":
            setRunId(event.runId as string);
            setBalance(event.balance as number);
            break;
          case "cached":
            toast.success("Same inputs as before — served from cache, free.");
            break;
          case "partial":
            setFrames((prev) => {
              const next = [...prev];
              next[event.frame as number] = {
                ...next[event.frame as number],
                partial: event.dataUrl as string,
              };
              return next;
            });
            break;
          case "frame":
            setFrames((prev) => {
              const next = [...prev];
              next[event.frame as number] = { url: event.url as string };
              return next;
            });
            break;
          case "textDelta":
            setTextOut((prev) => prev + (event.delta as string));
            break;
          case "text":
            setTextOut(event.content as string);
            break;
          case "audio":
            setAudioUrl(event.url as string);
            break;
          case "done":
            setBalance(event.balance as number);
            setPhase("done");
            router.refresh();
            break;
          case "error": {
            const message = event.message as string;
            setErrorMessage(message);
            if ((event.balance as number) >= 0) {
              setBalance(event.balance as number);
            }
            setPhase("error");
            router.refresh();
            toast.error(message, {
              description: event.refunded
                ? "Credits returned to your balance."
                : undefined,
            });
            break;
          }
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.trim()) handleEvent(JSON.parse(line));
        }
      }
      if (buffer.trim()) handleEvent(JSON.parse(buffer));
      setPhase((current) => (current === "running" ? "done" : current));
    } catch (error) {
      if (controller.signal.aborted) {
        setPhase("idle");
        toast("Run cancelled", {
          description: "Any debited credits come back automatically.",
        });
      } else {
        const message = error instanceof Error ? error.message : "Run failed";
        setErrorMessage(message);
        setPhase("error");
        toast.error(message);
      }
    }
  }, [missingHint, insufficient, running, frameCount, tool.slug, params, files, mask, router]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleShare = useCallback(async () => {
    if (!runId) return;
    const response = await fetch(`/api/runs/${runId}/share`, { method: "POST" });
    if (response.ok) {
      setShared(true);
      toast.success("Published to Inspiration.");
    } else {
      const data = await response.json().catch(() => ({}));
      toast.error(data.error ?? "Could not share this run.");
    }
  }, [runId]);

  const handleCopyText = useCallback(async () => {
    await navigator.clipboard.writeText(textOut);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [textOut]);

  const selectedLook = params.look ? getLook(params.look) : undefined;
  const buttonLabel = running
    ? `Working… ${elapsed}s`
    : frameCount > 1
      ? `Create ${frameCount} frames · ${tool.price} cr`
      : `Create · ${tool.price} cr`;

  const showResultPanel = phase !== "idle";
  const finishedFiles =
    tool.output.kind === "audio"
      ? audioUrl
        ? [{ label: "Download MP3", url: audioUrl }]
        : []
      : frames
          .filter((frame) => frame.url)
          .map((frame, index) => ({
            label: frameCount > 1 ? `Frame ${index + 1}` : "Download",
            url: frame.url!,
          }));

  const renderControl = (control: Control) => {
    switch (control.kind) {
      case "select":
        return (
          <div key={control.id}>
            <p className="mb-1.5 text-xs font-medium text-zinc-600">
              {control.label}
            </p>
            <Select
              value={params[control.id]}
              onValueChange={(value) => setParam(control.id, value)}
              options={control.options}
              ariaLabel={control.label}
            />
          </div>
        );
      case "text":
        return (
          <div key={control.id}>
            <p className="mb-1.5 text-xs font-medium text-zinc-600">
              {control.label}
            </p>
            <input
              type="text"
              value={params[control.id]}
              disabled={running}
              onChange={(event) => setParam(control.id, event.target.value)}
              placeholder={control.placeholder}
              className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-purple-500/60 focus:outline-none disabled:opacity-50"
            />
          </div>
        );
      case "textarea":
        return (
          <div key={control.id}>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-600">{control.label}</p>
              {control.maxLength ? (
                <p className="text-[11px] text-zinc-400">
                  {params[control.id]?.length ?? 0}/{control.maxLength}
                </p>
              ) : null}
            </div>
            <textarea
              value={params[control.id]}
              disabled={running}
              maxLength={control.maxLength}
              onChange={(event) => setParam(control.id, event.target.value)}
              placeholder={control.placeholder}
              rows={4}
              className="w-full resize-none rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-purple-500/60 focus:outline-none disabled:opacity-50"
            />
            {control.examples ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {control.examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    disabled={running}
                    onClick={() => setParam(control.id, example)}
                    className="chip text-left transition-colors hover:border-zinc-400 disabled:opacity-50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      case "switch":
        return (
          <div key={control.id} className="flex items-center justify-between">
            <p className="text-sm text-zinc-700">{control.label}</p>
            <Switch
              checked={params[control.id] === "true"}
              onCheckedChange={(checked) =>
                setParam(control.id, checked ? "true" : "false")
              }
              ariaLabel={control.label}
            />
          </div>
        );
      case "brushMask":
        return files.photo ? (
          <BrushMask
            key={control.id}
            file={files.photo}
            label={control.label}
            onMaskChange={setMask}
            disabled={running}
          />
        ) : null;
      case "lookPicker":
        return selectedLook ? (
          <div key={control.id} className="flex flex-wrap items-center gap-2">
            <span className="chip border-purple-500/60 bg-purple-500/10 text-purple-700">
              {selectedLook.name}
              <button
                type="button"
                aria-label={`Remove look ${selectedLook.name}`}
                onClick={() => setParam(control.id, "")}
                disabled={running}
                className="ml-1 text-purple-400 hover:text-purple-700"
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
            <button
              type="button"
              onClick={() => setParam(control.id, "")}
              disabled={running}
              className="text-xs text-zinc-500 hover:text-zinc-700"
            >
              Clear the look
            </button>
          </div>
        ) : (
          <p key={control.id} className="text-sm text-zinc-500">
            Pick a look from the grid →
          </p>
        );
    }
  };

  const resultPanel = (
    <div className="card-panel flex min-h-[420px] flex-col p-5">
      {tool.output.kind === "image" ? (
        <div
          className={`grid flex-1 gap-3 ${frameCount > 1 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {(frames.length > 0
            ? frames
            : Array.from({ length: frameCount }, () => ({}) as FrameState)
          ).map((frame, index) => (
            <div
              key={index}
              className="relative flex items-center justify-center overflow-hidden rounded-xl border border-black/8 bg-black/[0.02]"
            >
              {frame.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={frame.url}
                  alt={`Result frame ${index + 1}`}
                  className="frame-develop size-full object-cover"
                />
              ) : frame.partial ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={frame.partial}
                  alt="Developing…"
                  className="size-full object-cover opacity-80 blur-[2px]"
                />
              ) : running ? (
                <div className="flex flex-col items-center gap-2 py-16 text-zinc-400">
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  <span className="text-xs">developing…</span>
                </div>
              ) : (
                <span className="py-16 text-xs text-zinc-300">·</span>
              )}
            </div>
          ))}
        </div>
      ) : tool.output.kind === "audio" ? (
        <div className="flex flex-1 items-center justify-center">
          {audioUrl ? (
            /* eslint-disable-next-line jsx-a11y/media-has-caption */
            <audio controls src={audioUrl} className="w-full" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              {running ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  <span className="text-xs">recording the voice…</span>
                </>
              ) : (
                <span className="text-xs">The voiceover will appear here.</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1">
          {textOut ? (
            <div className="relative">
              <button
                type="button"
                onClick={handleCopyText}
                aria-label="Copy text"
                className="absolute right-0 top-0 rounded-lg p-2 text-zinc-500 hover:bg-black/5 hover:text-zinc-700"
              >
                {copied ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
              </button>
              <pre className="whitespace-pre-wrap pr-10 font-mono text-sm leading-relaxed text-zinc-700">
                {textOut}
              </pre>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400">
              {running ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  <span className="text-xs">writing…</span>
                </>
              ) : (
                <span className="text-xs">The text will appear here.</span>
              )}
            </div>
          )}
        </div>
      )}

      {phase === "error" && errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-700">
          {errorMessage} — credits returned to your balance.
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-black/8 pt-4">
          {finishedFiles.map((file) => (
            <a
              key={file.url}
              href={`${file.url}?download`}
              className="chip transition-colors hover:border-zinc-400"
            >
              <Download className="size-3.5" aria-hidden /> {file.label}
            </a>
          ))}
          {runId ? (
            <Link
              href={`/r/${runId}`}
              className="chip transition-colors hover:border-zinc-400"
            >
              <ExternalLink className="size-3.5" aria-hidden /> Result page
            </Link>
          ) : null}
          {tool.output.kind === "image" && runId && !shared ? (
            <button
              type="button"
              onClick={handleShare}
              className="chip transition-colors hover:border-purple-500/60"
            >
              <Share2 className="size-3.5" aria-hidden /> Share to Inspiration
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={`grid gap-6 ${isStudio ? "lg:grid-cols-[380px_1fr]" : "lg:grid-cols-[420px_1fr]"}`}
    >
      {/* Form column */}
      <div className="card-panel h-fit space-y-5 p-5">
        {tool.inputs.map((input: FileInput) => (
          <div key={input.id}>
            <p className="mb-1.5 text-xs font-medium text-zinc-600">
              {input.label}
              {input.required ? "" : " (optional)"}
            </p>
            <FileDrop
              input={input}
              file={files[input.id] ?? null}
              onFile={(file) => {
                setFiles((prev) => ({ ...prev, [input.id]: file }));
                if (hasBrush) setMask(null);
              }}
              disabled={running}
            />
          </div>
        ))}

        {tool.controls.map(renderControl)}

        {insufficient && !running ? (
          <Link
            href="/dashboard/billing"
            className="btn-gradient block w-full py-3 text-center text-sm"
          >
            Top up to run · {tool.price} cr
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleRun}
            disabled={Boolean(missingHint) || running}
            className="btn-gradient flex w-full items-center justify-center gap-2 py-3 text-sm"
          >
            {running ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {buttonLabel}
          </button>
        )}

        {running ? (
          <button
            type="button"
            onClick={handleCancel}
            className="w-full rounded-full border border-zinc-300 py-2.5 text-sm text-zinc-700 hover:border-zinc-400"
          >
            Cancel
          </button>
        ) : null}

        <p className="text-center text-xs text-zinc-500">
          {insufficient
            ? `Not enough credits — this run costs ${tool.price} cr, you have ${balance}.`
            : (missingHint ?? `Balance after this run: ${balance - tool.price}`)}
        </p>
      </div>

      {/* Right column */}
      <div>
        {isStudio && !showResultPanel ? (
          <LookPicker
            selected={params.look || null}
            onSelect={(slug) => setParam("look", slug)}
            disabled={running}
          />
        ) : (
          resultPanel
        )}
        {isStudio && showResultPanel && phase !== "running" ? (
          <button
            type="button"
            onClick={() => {
              setPhase("idle");
              setFrames([]);
            }}
            className="mt-4 text-sm text-zinc-600 hover:text-zinc-900"
          >
            ← Back to the looks
          </button>
        ) : null}
      </div>
    </div>
  );
};
