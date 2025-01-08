"use server";

import { adminDb } from "@/firebase-admin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { Message } from "@/types/types";
import { auth } from "@clerk/nextjs/server";

const FREE_LIMIT = 3;
const PRO_LIMIT = 100;

export async function askQuestion(id: string, question: string) {
  auth.protect();
  const { userId } = await auth();

  // get the chat reference from firebase
  const chatRef = adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .collection("chat");

  // figure out how many of the messages were human messages
  // limit the amount of messages later...
  const allChats = await chatRef.get();
  const userMessages = allChats.docs.filter(
    (doc) => doc.data().role === "human"
  );

  // create the new message
  const userMessage: Message = {
    role: "human",
    message: question,
    sources: null,
    createdAt: new Date(),
  };

  // add to db
  await chatRef.add(userMessage);

  // generate the AI message
  const reply = await generateLangchainCompletion(id, question);
  const aiMessage: Message = {
    role: "ai",
    message: reply.answer,
    sources: reply.context.slice(0, 2).map((c) => c.pageContent),
    createdAt: new Date(),
  };

  // add to db
  await chatRef.add(aiMessage);

  return { success: true, message: null };
}
