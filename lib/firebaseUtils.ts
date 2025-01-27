import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebase-admin";
import {
  STARTER_DOCUMENT_LIMIT,
  STARTER_MESSAGE_LIMIT,
  PRO_DOCUMENT_LIMIT,
  PRO_MESSAGE_LIMIT,
} from "@/constants";

export async function getPdfContent(docId: string) {
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

  if (!downloadUrl) throw new Error(`download URL not found for doc ${docId}`);

  console.log("--Download URL found, fetching document--");
  const response = await fetch(downloadUrl);
  const responseBlob = await response.blob();

  return responseBlob;
}

export async function getChatHistory(docId: string) {
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
  return chatMessages.docs.map((doc) => doc.data());
}

export async function getMembershipLevelAndLimits() {
  const { userId } = await auth();
  const userRef = await adminDb.collection("users").doc(userId!).get();
  const userData = userRef.data();
  const membershipLevel = userData!.membershipLevel;

  switch (membershipLevel) {
    case "starter":
      return {
        membershipLevel,
        messageLimit: STARTER_MESSAGE_LIMIT,
        documentLimit: STARTER_DOCUMENT_LIMIT,
      };
    case "pro":
      return {
        membershipLevel,
        messageLimit: PRO_MESSAGE_LIMIT,
        documentLimit: PRO_DOCUMENT_LIMIT,
      };
    default:
      return {
        membershipLevel,
      };
  }
  // return
}
