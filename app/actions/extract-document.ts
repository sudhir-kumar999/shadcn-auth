"use server";

import mammoth from "mammoth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseStorageServer } from "@/lib/supabase/storage-server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Note: .doc (application/msword) is NOT supported
];

export async function extractDocument(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file" };

  if (file.size > MAX_FILE_SIZE) {
    return { error: "File size must be less than 5 MB" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { 
      error: "Only PDF and DOCX documents are allowed. Legacy .doc files are not supported - please convert to .docx first." 
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `${user.id}/docs/${Date.now()}-${file.name}`;

  // ⬆ Upload to Supabase
  const { error: uploadError } = await supabaseStorageServer.storage
    .from("documents")
    .upload(filePath, buffer, { contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  // 📄 TEXT EXTRACTION
  let extractedText = "";
  let extractedHtml = "";

  try {
    if (file.type === "application/pdf") {
      // ✅ PDF Extraction
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser(null, true);

      const pdfData = await new Promise<any>((resolve, reject) => {
        pdfParser.on("pdfParser_dataReady", resolve);
        pdfParser.on("pdfParser_dataError", reject);
        pdfParser.parseBuffer(buffer);
      });

      extractedText = pdfParser.getRawTextContent();
      extractedHtml = convertPdfToHtml(pdfData);

    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // ✅ DOCX Only - with alignment preservation
      const result = await mammoth.convertToHtml({ 
        buffer,
        // options: {
        //   preserveEmptyParagraphs: true,
        //   styleMap: [
        //     "p[style-name='Center'] => p.center:fresh",
        //     "p[style-name='Heading 1'] => h1:fresh",
        //     "p[style-name='Heading 2'] => h2:fresh",
        //     "p[style-name='Heading 3'] => h3:fresh",
        //   ]
        // }
      });
      
      // Add inline styles for alignment
      extractedHtml = result.value
        .replace(/<p class="center">/g, '<p style="text-align: center;">')
        .replace(/<p>/g, '<p style="text-align: left;">');
      
      const rawTextResult = await mammoth.extractRawText({ buffer });
      // Fix spacing issues by normalizing whitespace
      extractedText = rawTextResult.value
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
        .replace(/[ \t]+/g, ' ')  // Normalize spaces/tabs to single space
        .trim();
    }
  } catch (extractError) {
    console.error("Text extraction error:", extractError);
    return { error: "Failed to extract text from document" };
  }

  if (!extractedText || extractedText.trim().length === 0) {
    return { error: "No text could be extracted from the document" };
  }

  // 💾 Save to DB
  const { error: dbError } = await supabase.from("documents").insert({
    user_id: user.id,
    file_name: file.name,
    file_path: filePath,
    extracted_text: extractedText,
    extracted_html: extractedHtml,
  });

  if (dbError) return { error: dbError.message };

  return {
    text: extractedText,
    html: extractedHtml,
  };
}

// 🎨 PDF to HTML converter
function convertPdfToHtml(pdfData: any): string {
  if (!pdfData.Pages || pdfData.Pages.length === 0) {
    return "<p>No content found</p>";
  }

  let html = '<div class="pdf-document">';

  pdfData.Pages.forEach((page: any, pageIndex: number) => {
    html += `<div class="pdf-page" data-page="${pageIndex + 1}">`;

    if (!page.Texts || page.Texts.length === 0) {
      html += "</div>";
      return;
    }

    const lines = new Map<number, any[]>();
    
    page.Texts.forEach((text: any) => {
      const y = Math.round(text.y * 10);
      if (!lines.has(y)) {
        lines.set(y, []);
      }
      lines.get(y)!.push(text);
    });

    const sortedLines = Array.from(lines.entries()).sort((a, b) => a[0] - b[0]);

    sortedLines.forEach(([_, texts]) => {
      texts.sort((a, b) => a.x - b.x);
      html += '<div class="pdf-line">';

      texts.forEach((text) => {
        if (!text.R || text.R.length === 0) return;

        text.R.forEach((run: any) => {
          const decodedText = decodeURIComponent(run.T || "");
          if (!decodedText.trim()) return;

          const fontFamily = run.TS?.[0] || 0;
          const fontSize = run.TS?.[1] || 12;
          const fontWeight = run.TS?.[2] || 0;
          const fontStyle = run.TS?.[3] || 0;

          let style = `font-size: ${fontSize}px;`;
          
          if (fontWeight === 1) {
            style += " font-weight: 700;";
          }
          
          if (fontStyle === 1) {
            style += " font-style: italic;";
          }

          const avgFontSize = 12;
          if (fontSize > avgFontSize * 1.5) {
            html += `<h2 style="${style}">${decodedText}</h2>`;
          } else if (fontSize > avgFontSize * 1.2) {
            html += `<h3 style="${style}">${decodedText}</h3>`;
          } else if (fontWeight === 1) {
            html += `<strong style="${style}">${decodedText}</strong>`;
          } else if (fontStyle === 1) {
            html += `<em style="${style}">${decodedText}</em>`;
          } else {
            html += `<span style="${style}">${decodedText}</span>`;
          }

          html += " ";
        });
      });

      html += "</div>";
    });

    html += "</div>";
  });

  html += "</div>";
  return html;
}