import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebase-admin";
import PdfView from "@/components/PdfView";

const FilesPage = async ({
  params: { id: fileId },
}: {
  params: { id: string };
}) => {
  auth.protect();
  const { userId } = await auth();

  // get the file, download it
  const ref = await adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(fileId)
    .get();
  const url = ref.data()?.downloadUrl;

  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      {/* right - chat */}
      <div className="px-2 col-span-5 lg:col-span-2 overflow-y-auto"></div>

      {/* left - view of PDF file */}
      <div className="px-2 col-span-5 lg:col-span-3 overflow-y-auto bg-slate-50 border-r-2 lg:border-primary lg:-order-1">
        <PdfView url={url} />
      </div>
    </div>
  );
};
export default FilesPage;
