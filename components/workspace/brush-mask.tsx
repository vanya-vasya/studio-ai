"use client";

import { Eraser } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Paint over the uploaded photo; painted pixels become fully transparent in
 * the exported mask PNG (what gpt-image-1 treats as "edit here").
 */
export const BrushMask = ({
  file,
  label,
  onMaskChange,
  disabled,
}: {
  file: File;
  label: string;
  onMaskChange: (mask: Blob | null) => void;
  disabled: boolean;
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const paintingRef = useRef(false);
  const [brushSize, setBrushSize] = useState(36);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setHasStrokes(false);
    const image = new window.Image();
    image.onload = () => {
      imageRef.current = image;
      // offscreen mask canvas at natural resolution, starts fully opaque black
      const mask = document.createElement("canvas");
      mask.width = image.naturalWidth;
      mask.height = image.naturalHeight;
      const ctx = mask.getContext("2d")!;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, mask.width, mask.height);
      maskCanvasRef.current = mask;
      const display = displayCanvasRef.current;
      if (display) {
        const displayCtx = display.getContext("2d")!;
        displayCtx.clearRect(0, 0, display.width, display.height);
      }
      onMaskChange(null);
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const exportMask = useCallback(() => {
    maskCanvasRef.current?.toBlob((blob) => onMaskChange(blob), "image/png");
  }, [onMaskChange]);

  const paintAt = useCallback(
    (clientX: number, clientY: number) => {
      const display = displayCanvasRef.current;
      const mask = maskCanvasRef.current;
      const image = imageRef.current;
      if (!display || !mask || !image) return;
      const rect = display.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // overlay stroke (violet, semi-transparent)
      const displayCtx = display.getContext("2d")!;
      displayCtx.fillStyle = "rgba(168, 85, 247, 0.55)";
      displayCtx.beginPath();
      displayCtx.arc(
        (x / rect.width) * display.width,
        (y / rect.height) * display.height,
        (brushSize / rect.width) * display.width,
        0,
        Math.PI * 2,
      );
      displayCtx.fill();

      // erase alpha on the natural-size mask
      const maskCtx = mask.getContext("2d")!;
      maskCtx.globalCompositeOperation = "destination-out";
      maskCtx.beginPath();
      maskCtx.arc(
        (x / rect.width) * mask.width,
        (y / rect.height) * mask.height,
        (brushSize / rect.width) * mask.width,
        0,
        Math.PI * 2,
      );
      maskCtx.fill();
      maskCtx.globalCompositeOperation = "source-over";
      setHasStrokes(true);
    },
    [brushSize],
  );

  const clearMask = useCallback(() => {
    const mask = maskCanvasRef.current;
    const display = displayCanvasRef.current;
    if (mask) {
      const ctx = mask.getContext("2d")!;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, mask.width, mask.height);
    }
    if (display) {
      display.getContext("2d")!.clearRect(0, 0, display.width, display.height);
    }
    setHasStrokes(false);
    onMaskChange(null);
  }, [onMaskChange]);

  if (!imageUrl) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-zinc-600">{label}</p>
      <div className="relative overflow-hidden rounded-xl border border-black/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Uploaded" className="block w-full select-none" />
        <canvas
          ref={displayCanvasRef}
          width={800}
          height={
            imageRef.current
              ? Math.round(
                  (800 * imageRef.current.naturalHeight) /
                    imageRef.current.naturalWidth,
                )
              : 800
          }
          className={`absolute inset-0 size-full ${
            disabled ? "pointer-events-none" : "cursor-crosshair"
          }`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            paintingRef.current = true;
            paintAt(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (paintingRef.current) paintAt(event.clientX, event.clientY);
          }}
          onPointerUp={() => {
            paintingRef.current = false;
            exportMask();
          }}
        />
      </div>
      <div className="mt-2.5 flex items-center gap-4">
        <label className="flex flex-1 items-center gap-2 text-xs text-zinc-500">
          Brush
          <input
            type="range"
            min={10}
            max={80}
            value={brushSize}
            disabled={disabled}
            onChange={(event) => setBrushSize(Number(event.target.value))}
            className="flex-1 accent-purple-500"
            aria-label="Brush size"
          />
        </label>
        {hasStrokes ? (
          <button
            type="button"
            onClick={clearMask}
            disabled={disabled}
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 disabled:opacity-40"
          >
            <Eraser className="size-3.5" aria-hidden /> Clear
          </button>
        ) : null}
      </div>
    </div>
  );
};
