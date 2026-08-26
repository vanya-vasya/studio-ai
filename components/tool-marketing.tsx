import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, type ToolConfig } from "@/lib/registry";

const controlSummary = (tool: ToolConfig): string => {
  const parts = tool.controls.map((control) => {
    switch (control.kind) {
      case "select":
        return `${control.label}: ${control.options.join(" / ")}`;
      case "switch":
        return `"${control.label}" switch`;
      case "brushMask":
        return "brush over the photo";
      case "lookPicker":
        return "24 looks to pick from";
      default:
        return control.label;
    }
  });
  return parts.join(" · ");
};

const whatYouGet = (tool: ToolConfig): string[] => {
  const lines: string[] = [];
  if (tool.output.kind === "image") {
    lines.push(
      tool.output.frames && tool.output.frames > 1
        ? `${tool.output.frames} frames per run`
        : "One finished result",
    );
    lines.push("You get downloadable images and a shareable link.");
  }
  if (tool.output.kind === "audio") {
    lines.push("One finished result");
    lines.push("You get an MP3 file and a shareable link.");
  }
  if (tool.output.kind === "text") {
    lines.push("One finished result");
    lines.push("You get plain text, ready to copy.");
  }
  lines.push("Usually under a minute, with live progress.");
  return lines;
};

export const ToolMarketing = ({
  tool,
  titleOverride,
  taglineOverride,
  children,
}: {
  tool: ToolConfig;
  titleOverride?: string;
  taglineOverride?: string;
  children?: React.ReactNode;
}) => {
  const category = CATEGORIES.find((item) => item.id === tool.category)!;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" aria-hidden /> All tools
      </Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="section-label">{category.name}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {titleOverride ?? tool.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600">
            {taglineOverride ?? tool.tagline}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="card-panel p-6">
              <h2 className="font-semibold text-zinc-900">What you bring</h2>
              <ul className="mt-4 space-y-3">
                {tool.inputs.length === 0 ? (
                  <li className="text-sm leading-relaxed text-zinc-600">
                    Nothing to upload — a short description is enough.
                  </li>
                ) : (
                  tool.inputs.map((input) => (
                    <li key={input.id} className="text-sm leading-relaxed text-zinc-600">
                      <span className="font-medium text-zinc-700">
                        {input.label}
                        {input.required ? "" : " (optional)"}
                      </span>{" "}
                      — {input.note}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="card-panel p-6">
              <h2 className="font-semibold text-zinc-900">What you get</h2>
              <ul className="mt-4 space-y-3">
                {whatYouGet(tool).map((line) => (
                  <li key={line} className="flex gap-2 text-sm leading-relaxed text-zinc-600">
                    <Check className="mt-0.5 size-4 shrink-0 text-purple-500" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {tool.controls.length > 0 ? (
            <p className="mt-6 text-sm leading-relaxed text-zinc-500">
              <span className="font-semibold uppercase tracking-wide text-zinc-600">
                Controls:
              </span>{" "}
              {controlSummary(tool)}
            </p>
          ) : null}

          {children}
        </div>

        <aside>
          <div className="card-panel sticky top-24 p-6">
            <p className="text-3xl font-bold text-zinc-900">
              {tool.price} <span className="text-lg text-zinc-600">credits per run</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              New accounts start with 20 credits, so the first run is on us. No
              subscription — credits never expire.
            </p>
            <Link
              href={`/dashboard/tools/${tool.slug}`}
              className="btn-gradient mt-6 block w-full py-3 text-center text-sm"
            >
              Open in the studio
            </Link>
            <Link
              href="/signup"
              className="mt-3 block w-full rounded-full border border-zinc-300 py-3 text-center text-sm text-zinc-700 hover:border-zinc-400"
            >
              Create a free account
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};
