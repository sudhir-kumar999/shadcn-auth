import { getDocuments } from "@/app/actions/get-documents";
import DocumentList from "./DocumentList";
import UploadForm from "./UploadForm";

export default async function DocumentsPage() {
  const docs = await getDocuments();

  return (
    <div>
      <h2>My Documents</h2>

      {/* Upload section */}
      <UploadForm />

      <hr />

      {/* All extracted documents from DB */}
      <DocumentList docs={docs} />
    </div>
  );
}
