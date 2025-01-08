"use server";

import { embedAndStoreDocs } from "@/lib/vectorStore";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(docId: string) {
  auth.protect();

  await embedAndStoreDocs(docId);
  revalidatePath("/dashboard");
}
