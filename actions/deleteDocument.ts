"use server";

import { auth } from "@clerk/nextjs/server";
import { adminDb, adminStorage } from "@/firebase-admin";
import pc from "@/lib/pinecone";
import { revalidatePath } from "next/cache";

export async function deleteDocument(docId: string) {
  auth.protect();
  const { userId } = await auth();
  // remove from firestore user > userId > files > docId &
  await adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(docId!)
    .delete();
  // delete all chats associated with that doc
  const chatRef = await adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(docId!)
    .collection("chat")
    .get();
  chatRef.docs.forEach(async (doc) => await doc.ref.delete());
  // remove from storage
  await adminStorage
    .bucket(process.env.FIREBASE_STORAGE_BUCKET!)
    .file(`users/${userId}/files/${docId}`)
    .delete();
  // remove from pinecone & embeddings
  const index = pc.index(process.env.PINECONE_INDEX_NAME!);
  await index.namespace(docId).deleteAll();

  // rebuild the documents page
  revalidatePath("/dashboard");
}
