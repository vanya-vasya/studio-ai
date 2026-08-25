"use client";

import { UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FileInput } from "@/lib/registry";

const formatSize = (bytes: number) => {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const FileDrop = ({
  input,
  file,
  onFile,
  disabled,
}: {
  input: FileInput;
  file: File | null;
  onFile: (file: File | null) => void;
  disabled: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const handlePick = useCallback(
    (picked: File | undefined) => {
      if (!picked) return;
      onFile(picked);
    },
    [onFile],
  );

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={file.name}
            className="size-14 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-lg bg-white/5 text-xl">
            🎵
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-100">{file.name}</p>
          <p className="text-xs text-zinc-500">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          aria-label={`Remove ${file.name}`}
          onClick={() => onFile(null)}
          disabled={disabled}
          className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200 disabled:opacity-40"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        handlePick(event.dataTransfer.files[0]);
      }}
      className={`w-full rounded-xl border border-dashed p-6 text-center transition-colors disabled:opacity-40 ${
        dragOver
          ? "border-purple-400/70 bg-purple-400/5"
          : "border-white/15 bg-white/[0.02] hover:border-white/30"
      }`}
    >
      <UploadCloud className="mx-auto size-6 text-zinc-500" aria-hidden />
      <p className="mt-2 text-sm font-medium text-zinc-200">
        Choose a file or drop it here
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {input.note} · up to 12 MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={input.accept}
        className="hidden"
        onChange={(event) => handlePick(event.target.files?.[0])}
      />
    </button>
  );
};
