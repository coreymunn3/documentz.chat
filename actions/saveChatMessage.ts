"use server";

import { adminDb } from "@/firebase-admin";
import { Message } from "@/types/types";
import { auth } from "@clerk/nextjs/server";

export async function saveChatMessage(docId: string, message: Message) {
  auth.protect();
  const { userId } = await auth();

  try {
    const chatRef = adminDb
      .collection("users")
      .doc(userId!)
      .collection("files")
      .doc(docId!)
      .collection("chat");

    await chatRef.add(message);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
