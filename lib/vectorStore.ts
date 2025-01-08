import { OpenAIEmbeddings } from "@langchain/openai";
import pc from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { getPdfContent } from "./firebaseUtils";
import { getChunkedDocsFromPdf } from "./pdfLoader";

async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  if (!namespace) throw new Error("no namespace provided");
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
}

export async function embedAndStoreDocs(docId: string) {
  try {
    // embeddings setup
    console.log("--- Generating Embeddings for the split documents---");
    const pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME!);
    const embeddings = new OpenAIEmbeddings();
    let pineconeVectorStore; // a variable to be assigned later

    /**
     * RE USE NAMESPACE & EMBEDDINGS
     * We only want to generate embeddings once. The pdf documents will not change, so
     * if the document exists in the namespace, we will re-use the embeddings.
     * Embeddings are costly and computationally intensive!
     */
    const namespaceAlreadyExists = await namespaceExists(pineconeIndex, docId);
    // if the namespace exists, retrieve the existing vector store
    if (namespaceAlreadyExists) {
      console.log(
        `-- Namespace ${docId} already exists, reusing vector embeddings-- `
      );
      pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: docId,
      });
      return pineconeVectorStore;
      /**
       * If new namespace:
       * 1. download PDF from firestore via the download URL
       * 2. parse the PDF, split the large document into smaller parts so the model can process it
       * 3. generate vector embeddings & store them in the Pinecone vector store
       */
    } else {
      // download the document (1)
      const downloadedPdf = await getPdfContent(docId);
      // parse, and split the documents (2)
      const chunkedDocs = await getChunkedDocsFromPdf(downloadedPdf);
      // generate and store embeddings (3)
      console.log(
        `--Storing the embeddings in namespace ${docId} in the ${process.env.PINECONE_INDEX_NAME} Pinecone vector store--`
      );
      pineconeVectorStore = await PineconeStore.fromDocuments(
        chunkedDocs,
        embeddings,
        {
          pineconeIndex: pineconeIndex,
          namespace: docId,
        }
      );

      return pineconeVectorStore;
    }
  } catch (error) {}
}
