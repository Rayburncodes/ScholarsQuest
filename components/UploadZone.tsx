"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
};

interface UploadZoneProps {
  onFileSelect: (file: File | null, pastedText: string) => void;
  onSubjectChange: (subject: string) => void;
  subject: string;
  disabled?: boolean;
}

export function UploadZone({
  onFileSelect,
  onSubjectChange,
  subject,
  disabled = false,
}: UploadZoneProps) {
  const [pastedText, setPastedText] = useState("");
  const [usePaste, setUsePaste] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setPastedText("");
        setUsePaste(false);
        onFileSelect(file, "");
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    disabled: disabled || usePaste,
    noClick: usePaste,
    noKeyboard: usePaste,
  });

  function handlePasteChange(value: string) {
    setPastedText(value);
    if (value.trim()) {
      onFileSelect(null, value.trim());
    } else {
      onFileSelect(null, "");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2 font-body">
          Subject (e.g. AP Biology, World History)
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Enter subject name"
          className="w-full rounded-xl border-2 border-navy-light bg-navy-light/50 px-4 py-3 text-white placeholder:text-white/40 focus:border-teal focus:outline-none font-body"
          disabled={disabled}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUsePaste(false)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            !usePaste ? "bg-teal text-navy" : "bg-navy-light text-white/70 hover:text-white"
          }`}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setUsePaste(true)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            usePaste ? "bg-teal text-navy" : "bg-navy-light text-white/70 hover:text-white"
          }`}
        >
          Paste text
        </button>
      </div>

      {!usePaste ? (
        <div
          {...getRootProps()}
          className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive ? "border-teal bg-teal/10" : "border-white/20 bg-navy-light/30 hover:border-teal/50"
          } ${disabled ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
        >
          <input {...getInputProps()} />
          <p className="text-white/80 font-body">
            {isDragActive ? "Drop the file here…" : "Drag & drop a PDF, .docx, or .txt file here, or click to browse"}
          </p>
          <p className="text-sm text-white/50 mt-1">PDF, .docx, or .txt only</p>
        </div>
      ) : (
        <textarea
          value={pastedText}
          onChange={(e) => handlePasteChange(e.target.value)}
          placeholder="Paste your syllabus, chapter, or notes here…"
          rows={8}
          className="w-full rounded-xl border-2 border-navy-light bg-navy-light/50 px-4 py-3 text-white placeholder:text-white/40 focus:border-teal focus:outline-none resize-y font-body"
          disabled={disabled}
        />
      )}
    </div>
  );
}
