import { auth } from "@clerk/nextjs/server";
// langchain deps
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
// utils
import { getChatHistory } from "./firebaseUtils";
import { DocumentData } from "firebase/firestore";
import { embedAndStoreDocs } from "./vectorStore";

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
  const pineconeVectorStore = await embedAndStoreDocs(docId);
  console.log(pineconeVectorStore);
  if (!pineconeVectorStore) {
    throw new Error("Pinecone vectore store not found!");
  }

  // creating a retriever to search through the vector store
  console.log("--Creating a Retriever--");
  const retriever = pineconeVectorStore.asRetriever();

  // fetching chat history
  console.log("--Fetching Chat History--");
  const chatHistory = await getChatHistory(docId);
  console.log("--Converting Chat Histoy into Langchain Format--");
  const chatHistoryForLangchain = langchainFormattedChatHistory(chatHistory);

  // define a prompt template
  console.log("--Defining a prompt template for asking questions--");
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistoryForLangchain, // the actual chat history
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
    ...chatHistoryForLangchain,
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
    chat_history: chatHistoryForLangchain,
    input: question,
  });

  console.log(reply);

  return reply.answer;
}
