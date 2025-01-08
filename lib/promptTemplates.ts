import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

// Creates a standalone question from the chat-history and the current question
const STANDALONE_QUESTION_PROMPT = `Given the following chat history and a question which might reference context in the chat history, 
formulate a standalone question which can be understood without the chat history. DO NOT answer the question, just reformulate it if needed and otherwise return it as is.
rephrase the question to be a standalone question.`;

export const contextualizedQuestionPrompt = ChatPromptTemplate.fromMessages([
  ["system", STANDALONE_QUESTION_PROMPT],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);

// Actual question you ask the chat and send the response to client
const SYSTEM_PROMPT = `You are an enthusiastic AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.

{context}`;

export const qaPrompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);
