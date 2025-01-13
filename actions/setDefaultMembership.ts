"use server";

import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";

/**
 * This function sets the membership for the current user to 'starter' which is the default level
 * @returns void
 */
export async function setDefaultMembership() {
  auth.protect();
  const { userId } = await auth();

  try {
    // get the user collection
    const userRef = adminDb.collection("users").doc(userId!);

    // set the default membership level = starter
    const data = {
      membershipLevel: "starter",
    };
    await userRef.update(data);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
