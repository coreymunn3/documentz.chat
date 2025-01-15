// langchain deps
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { contextualizedQuestionPrompt, qaPrompt } from "./promptTemplates";
// ai sdk
// import { streamText, LangChainAdapter } from "ai";
// utils
import { getChatHistory } from "./firebaseUtils";
import { DocumentData } from "firebase/firestore";
import { getExistingVectorStore } from "./vectorStore";

/**
 * create our models
 */
export const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

// Caching setup for retrievers and chains
const retrieverCache = new Map<string, any>();
const chainCache = new Map<string, any>();
console.log(chainCache);

function langchainFormattedChatHistory(chatHistory: DocumentData[]) {
  const chatHistoryForLangchain = chatHistory.map((chat) =>
    chat.role === "human"
      ? new HumanMessage(chat.message)
      : new AIMessage(chat.message)
  );
  return chatHistoryForLangchain;
}

/**
 * Get the retriever from a cache or creates one if no cache
 * @param docId document id for firebase
 * @returns pinecone vector store, as Retriever
 */
async function getRetriever(docId: string) {
  if (!retrieverCache.has(docId)) {
    console.log(
      `--Creating a document retriever from the Pinecone vector store for ${docId}--`
    );
    const retriever = (await getExistingVectorStore(docId)).asRetriever();
    retrieverCache.set(docId, retriever);
  }
  return retrieverCache.get(docId);
}

/**
 * get history aware retriever chain from a cache or creates one if no cache
 * @param docId document id for firebase
 * @returns the history aware retriever chain
 */
async function getHistoryAwareRetrieverChain(docId: string) {
  if (!chainCache.has(docId)) {
    const retriever = await getRetriever(docId);
    console.log(`--Creating a History-aware retriever chain for ${docId}--`);
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: model,
      retriever,
      rephrasePrompt: contextualizedQuestionPrompt,
    });
    chainCache.set(docId, historyAwareRetrieverChain);
  }
  return chainCache.get(docId);
}

export async function generateLangchainCompletion(
  docId: string,
  question: string
) {
  try {
    // 1. get the vector store and chat history for context to the chain
    console.log(`STEP 1: ${docId}`);
    console.log(
      "--Fetching Pinecone vector store & Chat history in parallel--"
    );
    const [pineconeVectorStore, chatHistory] = await Promise.all([
      getExistingVectorStore(docId),
      getChatHistory(docId),
    ]);

    if (!pineconeVectorStore) {
      throw new Error("Pinecone vectore store not found");
    }

    // 2. Create the history-aware retriever chain
    console.log(`STEP 2: ${docId}`);
    console.log("--Getting or creating a history aware retriever chain--");
    const historyAwareRetrieverChain = await getHistoryAwareRetrieverChain(
      docId
    );

    // Create document combining chain
    console.log(`STEP 3: ${docId}`);
    console.log("--Creating a document combining chain--");
    const combineDocsChain = await createStuffDocumentsChain({
      llm: model,
      prompt: qaPrompt,
    });

    // Create the main RAG chain
    console.log(`STEP 4: ${docId}`);
    console.log("creating the main RAG chain");
    const ragChain = await createRetrievalChain({
      retriever: historyAwareRetrieverChain,
      combineDocsChain: combineDocsChain,
    });

    // invoke the chain with question and message history
    console.log(`STEP 5: ${docId}`);
    console.log(
      "--Sanitizing the question & creating a Langchain-formatted chat history--"
    );
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const chatHistoryForLangchain = langchainFormattedChatHistory(chatHistory!);

    console.log(`STEP 6: ${docId}`);
    console.log("--Running the chain with context & conversation--");
    const reply = await ragChain.invoke({
      chat_history: chatHistoryForLangchain,
      input: sanitizedQuestion,
    });

    return reply;
  } catch (error) {
    console.error("Error generating Langchain completion: ", error);
    throw new Error("Failed to generate completion");
  }
}
