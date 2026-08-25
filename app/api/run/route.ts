import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { executeRun, type RunEvent, type RunFile } from "@/lib/engine";
import { getTool } from "@/lib/registry";
import { ensureUser } from "@/lib/users";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to run tools" }, { status: 401 });
  }
  const user = await ensureUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to run tools" }, { status: 401 });
  }

  const form = await req.formData();
  const toolSlug = String(form.get("tool") ?? "");
  const tool = getTool(toolSlug);
  if (!tool) {
    return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
  }

  let params: Record<string, string> = {};
  try {
    params = JSON.parse(String(form.get("params") ?? "{}"));
  } catch {
    return NextResponse.json({ error: "Bad params" }, { status: 400 });
  }

  const files: RunFile[] = [];
  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      if (value.size > 12 * 1024 * 1024) {
        return NextResponse.json(
          { error: `"${value.name}" is over 12 MB` },
          { status: 400 },
        );
      }
      files.push({
        id: key,
        name: value.name,
        mime: value.type || "application/octet-stream",
        bytes: Buffer.from(await value.arrayBuffer()),
      });
    }
  }

  for (const input of tool.inputs) {
    if (input.required && !files.some((file) => file.id === input.id)) {
      return NextResponse.json(
        { error: `Upload: ${input.label.toLowerCase()}` },
        { status: 400 },
      );
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const emit = (event: RunEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // client disconnected mid-write; the abort signal handles the rest
        }
      };
      executeRun({
        userId: user.id,
        tool,
        params,
        files,
        signal: req.signal,
        emit,
      })
        .catch((error: unknown) => {
          emit({
            type: "error",
            message: error instanceof Error ? error.message : "Run failed",
            refunded: false,
            balance: -1,
          });
        })
        .finally(() => {
          try {
            controller.close();
          } catch {
            // already closed
          }
        });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
