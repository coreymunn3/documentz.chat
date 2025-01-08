import { auth } from "@clerk/nextjs/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function getChunkedDocsFromPdf(documentBlob: Blob) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User Not Found - please log in to continue");
  }

  try {
    const loader = new PDFLoader(documentBlob);
    const doc = await loader.load();
    console.log("docs", doc);

    console.log("--Splitting the document into smaller parts--");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunkDocs = await splitter.splitDocuments(doc);
    console.log("split docs ", chunkDocs);
    console.log(`--Split document into ${chunkDocs.length} parts--`);
    return chunkDocs;
  } catch (error) {
    console.error(error);
    throw new Error("PDF docs chunking failed");
  }
}
