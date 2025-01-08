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

function langchainFormattedChatHistory(chatHistory: DocumentData[]) {
  const chatHistoryForLangchain = chatHistory.map((chat) =>
    chat.role === "human"
      ? new HumanMessage(chat.message)
      : new AIMessage(chat.message)
  );
  return chatHistoryForLangchain;
}

export async function generateLangchainCompletion(
  docId: string,
  question: string
) {
  const pineconeVectorStore = await getExistingVectorStore(docId);
  if (!pineconeVectorStore) {
    throw new Error("Pinecone vectore store not found");
  }
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");

  // creating a retriever to search through the vector store
  console.log("--Creating a Retriever--");
  const retriever = pineconeVectorStore.asRetriever();

  // fetching chat history
  console.log("--Fetching Chat History--");
  const chatHistory = await getChatHistory(docId);
  console.log("--Converting Chat Histoy into Langchain Format--");
  const chatHistoryForLangchain = langchainFormattedChatHistory(chatHistory);

  // create a history-aware retriever chain that can rephrase the prompt into a meaningful standalone question and use message history as context
  console.log("--Creating a History-aware retriever chain--");
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: contextualizedQuestionPrompt,
  });

  // create a chain to combine the retrieved documents into a conherent response
  console.log("--Creating a document combining chain--");
  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: qaPrompt,
  });

  // create the main retrieval chain that combines history-aware retriever and document combining chains
  console.log("creating the main RAG chain");
  const ragChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: combineDocsChain,
  });

  // invoke the chain
  console.log("--Running the chain with a conversation--");
  const reply = await ragChain.invoke({
    chat_history: chatHistoryForLangchain,
    input: sanitizedQuestion,
  });
  console.log(reply);
  return reply;
}
