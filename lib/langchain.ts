import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";
// langchain deps
import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
// pinecone deps
import pc from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";

export const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const indexName = "pdf";

async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  if (!namespace) throw new Error("no namespace provided");
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
}

async function fetchMessagesFromDb(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User ID not found");
  // get messages
  const chatRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("chat");
  const chatMessages = await chatRef.get();
  // converto to langchain format
  const chatHistoryForLangchain = chatMessages.docs.map((doc) => {
    return doc.data().role === "human"
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message);
  });
  return chatHistoryForLangchain;
}

export async function generateDocs(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User Not Found - please log in to continue");
  }

  console.log("--Fetching download URL from Firebase--");
  const firebaesRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();
  const downloadUrl = firebaesRef.data()?.downloadUrl;
  console.log("download url", downloadUrl);

  if (!downloadUrl) throw new Error(`download URL not found for doc ${docId}`);
  console.log("--Download URL found, Loadign PDF--");

  const response = await fetch(downloadUrl);
  const dataBlob = await response.blob();
  const loader = new PDFLoader(dataBlob);
  const docs = await loader.load();
  console.log("docs", docs);

  console.log("--Splitting the document into smaller parts--");
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);
  console.log("split docs ", splitDocs);
  console.log(`--Split document into ${splitDocs.length} parts--`);

  return splitDocs;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User Not Found - please log in to continue");
  }

  let pineconeVectorStore;

  // embeddings setup
  console.log("--- Generating Embeddings for the split documents---");
  const pineconeIndex = pc.index(indexName);
  const embeddings = new OpenAIEmbeddings();

  /**
   * We only want to generate embeddings once. The pdf documents will not change, so
   * if the document exists in the namespace, we will re-use the embeddings.
   *
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
    // download, parse, and split the documents (1 & 2)
    const splitDocs = await generateDocs(docId);
    // generate and store embeddings (3)
    console.log(
      `--Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store--`
    );
    pineconeVectorStore = await PineconeStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pineconeIndex: pineconeIndex,
        namespace: docId,
      }
    );

    return pineconeVectorStore;
  }
}

export async function generateLangchainCompletion(
  docId: string,
  question: string
) {
  const pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(
    docId
  );
  console.log(pineconeVectorStore);
  if (!pineconeVectorStore) {
    throw new Error("Pinecone vectore store not found!");
  }

  // creating a retriever to search through the vector store
  console.log("--Creating a Retriever--");
  const retriever = pineconeVectorStore.asRetriever();

  // fetching chat history
  console.log("--Fetching Chat History--");
  const chatHistory = await fetchMessagesFromDb(docId);

  // define a prompt template
  console.log("--Defining a prompt template for asking questions--");
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory, // the actual chat history
    ["user", "{input}"],
    [
      "user",
      "given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
    ],
  ]);

  // create a history-aware retriever chain that users model, retriever, and prompt
  console.log("--Creating a History-aware retriever chain--");
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  // define a prompt template for answering questions based on retrieved context
  console.log("--Defining a prompt templte for Answering questions ");
  const historyAwareRetrieverPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer the user's questions based on the below context:\n\n{context}",
    ],
    ...chatHistory,
    ["user", "{input}"],
  ]);

  // create a chain to combine the retrieved documents into a conherent response
  console.log("--Creating a document combining chain--");
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrieverPrompt,
  });

  // create the main retrieval chain that combines history-aware retriever and document combining chains
  console.log("creating the main retrieval chain");
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  // invoke the chain
  console.log("--Running the chain with a conversation--");
  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });

  console.log(reply);

  return reply.answer;
}
