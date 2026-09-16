import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, FileUp, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export interface UploadAreaProps {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  busy?: boolean;
  title?: string;
  description?: string;
  /** Enables the camera capture affordance for inspection imagery. */
  enableCamera?: boolean;
  className?: string;
}

/**
 * UploadArea — glass drop target used by the vision, document and report
 * workspaces. Shows image previews when the browser can read the file.
 */
export function UploadArea({
  onFiles,
  accept = "image/*,.pdf,.docx,.xlsx,.pptx,.dwg",
  multiple = true,
  disabled,
  busy,
  title = "Drop files to upload",
  description = "Inspection imagery, drawings, SOPs, datasheets, spreadsheets or reports.",
  enableCamera,
  className,
}: UploadAreaProps) {
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const files = Array.from(fileList);
      setPreviews((current) => [
        ...current,
        ...files
          .filter((file) => file.type.startsWith("image/"))
          .map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
          .slice(0, 4),
      ]);
      onFiles?.(files);
    },
    [onFiles],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label={title}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "glass-inset flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-dashed px-6 py-10 text-center transition-all duration-300",
          dragging && "border-primary/60 bg-teal-50/60",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-primary transition-transform",
            dragging && "scale-110",
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <UploadCloud className="size-5" />
          )}
        </span>
        <p className="text-sm font-semibold text-foreground">
          {busy ? "Analysing securely…" : title}
        </p>
        <p className="max-w-md text-xs leading-5 text-muted-foreground">{description}</p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-pointer"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            <FileUp className="size-3.5" />
            Browse files
          </Button>
          {enableCamera ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="cursor-pointer"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                cameraRef.current?.click();
              }}
            >
              <Camera className="size-3.5" />
              Capture image
            </Button>
          ) : null}
        </div>
        <p className="text-[11px] text-muted-foreground/80">
          Files are processed inside the sovereign zone — nothing leaves MRPL infrastructure.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(event) => handleFiles(event.target.files)}
      />
      {enableCamera ? (
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      ) : null}

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {previews.map((preview) => (
            <div
              key={preview.url}
              className="glass group relative overflow-hidden rounded-lg"
            >
              <img
                src={preview.url}
                alt={preview.name}
                className="h-24 w-full object-cover"
              />
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <ImageIcon className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate text-[11px] text-muted-foreground">
                  {preview.name}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${preview.name}`}
                  className="ml-auto text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() =>
                    setPreviews((current) =>
                      current.filter((item) => item.url !== preview.url),
                    )
                  }
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
