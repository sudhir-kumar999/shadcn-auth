"use client";

import { useState } from "react";
import { updateDocument } from "@/app/actions/update-document";
import { deleteDocument } from "@/app/actions/delete-document";

export default function DocumentList({ docs }: { docs: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");

  return (
    <div className="grid gap-4 max-w-4xl mx-auto p-4">
      <style jsx>{`
        .document-viewer p[style*="text-align: center"] {
          text-align: center !important;
        }
        .document-viewer p[style*="text-align: left"] {
          text-align: left !important;
        }
        .document-viewer p[style*="text-align: right"] {
          text-align: right !important;
        }
        .document-viewer p[style*="text-align: justify"] {
          text-align: justify !important;
        }
      `}</style>

      {docs.map((doc) => {
        const isExpanded = expandedId === doc.id;
        const isEditing = editingId === doc.id;

        return (
          <div
            key={doc.id}
            className={`border rounded-lg p-5 transition-all duration-200 ${
              isExpanded
                ? "bg-white shadow-lg border-blue-200"
                : "bg-gray-50 hover:bg-gray-100 hover:shadow-md border-gray-200 cursor-pointer"
            }`}
            onClick={() => !isExpanded && setExpandedId(doc.id)}
          >
            {/* HEADER */}
            <h4 className="font-semibold text-lg text-gray-800 mb-2">
              📄 {doc.file_name}
            </h4>

            {/* COLLAPSED VIEW */}
            {!isExpanded && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {doc.extracted_text.slice(0, 180)}
                {doc.extracted_text.length > 180 && "..."}
              </p>
            )}

            {/* EXPANDED VIEW */}
            {isExpanded && (
              <div onClick={(e) => e.stopPropagation()}>
                {isEditing ? (
                  <>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={8}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                    />

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={async () => {
                          await updateDocument(doc.id, text);
                          setEditingId(null);
                          location.reload();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* VIEW MODE TOGGLE */}
                    {doc.extracted_html && (
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setViewMode("formatted")}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            viewMode === "formatted"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          ✨ Formatted View
                        </button>
                        <button
                          onClick={() => setViewMode("raw")}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            viewMode === "raw"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          📝 Plain Text
                        </button>
                      </div>
                    )}

                    {/* FORMATTED VIEW */}
                    {viewMode === "formatted" && doc.extracted_html ? (
                      <div
                        className="document-viewer bg-white text-sm p-6 rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto shadow-sm"
                        dangerouslySetInnerHTML={{ __html: doc.extracted_html }}
                      />
                    ) : (
                      /* RAW TEXT VIEW */
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-y-auto font-mono">
                        {doc.extracted_text}
                      </pre>
                    )}
                  </>
                )}

                {/* ACTIONS */}
                {!isEditing && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setEditingId(doc.id);
                        setText(doc.extracted_text);
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm("Delete this document?")) {
                          await deleteDocument(doc.id, doc.file_path);
                          location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                    >
                      🗑️ Delete
                    </button>

                    <button
                      onClick={() => {
                        setExpandedId(null);
                        setEditingId(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors ml-auto"
                    >
                      ✕ Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}