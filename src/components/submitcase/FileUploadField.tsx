"use client";

import { useId, useRef, useState } from "react";

const MB = 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

type Props = {
  label: string;
  description: string;
  multiple: boolean;
  accept: string;
  /** Per-file size limit in bytes. */
  maxSize: number;
  files: File[];
  onChange: (next: File[]) => void;
};

export default function FileUploadField({
  label,
  description,
  multiple,
  accept,
  maxSize,
  files,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming);
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const f of list) {
      if (f.size > maxSize) {
        rejected.push(`${f.name} (${formatSize(f.size)} > ${formatSize(maxSize)})`);
        continue;
      }
      accepted.push(f);
    }
    setError(rejected.length > 0 ? `Too large: ${rejected.join(", ")}` : null);
    onChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
      >
        {label}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-brandOrange bg-brandOrange/5"
            : "border-gray-300 bg-gray-50/40 hover:bg-gray-50"
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="text-[13.5px] text-gray-700 leading-snug">
          <span className="font-medium text-navy">Drop files here</span> or
          click to browse
        </div>
        <div className="text-[12px] text-gray-500 mt-1">{description}</div>
      </div>
      {error && (
        <div className="mt-2 text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </div>
      )}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px]"
            >
              <span className="truncate text-navy">{f.name}</span>
              <span className="shrink-0 text-gray-500 text-[12px]">
                {formatSize(f.size)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(files.filter((_, j) => j !== i));
                  }}
                  className="ml-3 text-gray-400 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 rounded"
                  aria-label={`Remove ${f.name}`}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
