"use server";

import { adminDb } from "@/firebase-admin";
import getBaseUrl from "@/lib/getBaseUrl";
import stripe from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

export async function createStripePortal() {
  auth.protect();

  // get the user's stripe Id
  const { userId } = await auth();
  const user = await adminDb.collection("users").doc(userId!).get();
  const userStripeCustomerId = user.data()?.stripeCustomerId;

  // extremely unlikly we will ever get here
  if (!userStripeCustomerId) {
    throw new Error("User does not have a Stripe customer ID currently set up");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: userStripeCustomerId,
    return_url: `${getBaseUrl()}/dashboard`,
  });

  return session.url;
}
