"use server";

import { adminDb } from "@/firebase-admin";
import getBaseUrl from "@/lib/getBaseUrl";
import stripe from "@/lib/stripe";
import { UserDetails } from "@/types/types";
import { auth } from "@clerk/nextjs/server";

export async function createCheckoutSession(userDetails: UserDetails) {
  const { userId } = await auth();

  // check to see if the user already has a stripe customer ID or not
  let stripeCustomerId;
  const user = await adminDb.collection("users").doc(userId!).get();
  stripeCustomerId = user.data()?.stripeCustomerId;

  // if it still doesnt exist here, we need to create one
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: userDetails.email,
      name: userDetails.name,
      metadata: {
        userId,
      },
    });

    // store the customer ID in firebase
    await adminDb.collection("users").doc(userId!).update({
      stripeCustomerId: customer.id,
    });

    stripeCustomerId = customer.id;
  }

  // create a checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1QgcOpCvkCpGNGFhHOJvkDnz",
        quantity: 1,
      },
    ],
    mode: "subscription",
    customer: stripeCustomerId,
    automatic_tax: {
      enabled: false,
    },
    success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
    cancel_url: `${getBaseUrl()}/dashboard/upgrade`,
  });

  return session.id;
}
