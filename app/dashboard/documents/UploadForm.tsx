"use client";

import { extractDocument } from "@/app/actions/extract-document";
import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(formData: FormData) {
    if (error) return;
    setLoading(true);
    await extractDocument(formData);
    setLoading(false);
    location.reload();
  }

  return (
    <form action={handleUpload} className="space-y-4">
      <div className="rounded-xl border border-dashed p-6">
        <label className="flex flex-col items-center cursor-pointer">
          <FileText className="w-8 h-8 text-blue-600" />
          <p className="text-sm text-gray-600 mt-2">
            {fileName ?? "Upload PDF or Word document (max 5 MB)"}
          </p>

          <input
            type="file"
            name="file"
            required
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (!ALLOWED_TYPES.includes(file.type)) {
                setError("Only PDF and Word documents are allowed");
                setFileName(null);
                e.target.value = "";
                return;
              }

              if (file.size > MAX_FILE_SIZE) {
                setError("File size must be less than 5 MB");
                setFileName(null);
                e.target.value = "";
                return;
              }

              setFileName(file.name);
              setError(null);
            }}
          />
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        disabled={loading || !!error}
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Upload & Extract"}
      </button>
    </form>
  );
}
