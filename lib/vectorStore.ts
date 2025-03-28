import { OpenAIEmbeddings } from "@langchain/openai";
import pc from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { getPdfContent } from "./firebaseUtils";
import { getChunkedDocsFromPdf } from "./pdfLoader";

/**
 * Checks to see if the pinecone namespace exists. We don't want to duplicate namespaces.
 * @param index Pinecone Index, from PINECONE_INDEX_NAME variable
 * @param namespace string
 * @returns Boolean
 */
async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  if (!namespace) throw new Error("no namespace provided");
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
}

/**
 * Retrieves the pinecone vectore store from an existing index, as denoted by the PINECONE_INDEX_NAME variable
 * currently, we only have 1 index!
 * @param docId firebase document Id
 * @returns PineconeStore object
 */
export async function getExistingVectorStore(docId: string) {
  const pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME!);
  const embeddings = new OpenAIEmbeddings();
  try {
    const pineconeVectorStore = await PineconeStore.fromExistingIndex(
      embeddings,
      {
        pineconeIndex,
        namespace: docId,
        textKey: "text",
      }
    );
    return pineconeVectorStore;
  } catch (error) {
    console.log("error ", error);
    throw new Error("Failed to load vector store");
  }
}

/**
 * Attempts to reuse the namespace using the pinecone index and ID.
 * If the namespace does not exist, we download the PDF from firestore, chunk it,
 * and create a new Pinecone Vector Store from the chunks, then return it
 * @param docId firebase document ID
 * @returns the Pinecone Vector Store
 */
export async function embedAndStoreDocs(docId: string) {
  try {
    console.log("--- Generating Embeddings for the split documents---");
    const pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME!);
    const embeddings = new OpenAIEmbeddings();
    let pineconeVectorStore;

    /**
     * RE USE NAMESPACE & EMBEDDINGS
     * We only want to generate embeddings once. The pdf documents will not change, so
     * if the document exists in the namespace, we will re-use the embeddings.
     * Embeddings are costly and computationally intensive!
     */
    const namespaceAlreadyExists = await namespaceExists(pineconeIndex, docId);
    // if the namespace exists, retrieve the existing vector store
    if (namespaceAlreadyExists) {
      pineconeVectorStore = await getExistingVectorStore(docId);
      return pineconeVectorStore;
    } else {
      /**
       * If new namespace:
       * 1. download PDF from firestore via the download URL
       * 2. parse the PDF, split the large document into smaller parts so the model can process it
       * 3. generate vector embeddings & store them in the Pinecone vector store
       */

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
          textKey: "text",
        }
      );

      return pineconeVectorStore;
    }
  } catch (error) {
    console.error(error);
    throw new Error(
      "Error encountered when generating vector embeddings and storing in Pinecone"
    );
  }
}
