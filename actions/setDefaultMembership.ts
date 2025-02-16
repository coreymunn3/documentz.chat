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

  if (!userId) {
    console.error("User ID is undefined.");
    return { success: false };
  }

  const defaultUserData = {
    membershipLevel: "starter",
  };

  try {
    // get the user collection
    const userRef = adminDb.collection("users").doc(userId!);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // if the user DOESNT exist, create it with the default membership level
      await userRef.set(defaultUserData);
    } else {
      // if the user DOES exist for some reason, updated the uesr to membership level = starter
      await userRef.update(defaultUserData);
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
