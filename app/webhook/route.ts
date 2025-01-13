import { adminDb } from "@/firebase-admin";
import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getUserDetails = async (stripeCustomerId: string) => {
  const userDoc = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", stripeCustomerId)
    .limit(1)
    .get();
  if (!userDoc.empty) {
    return userDoc.docs[0];
  }
};

export async function POST(req: NextRequest) {
  const headersList = headers();
  const sig = headersList.get("stripe-signature");
  const body = await req.text();

  if (!sig) {
    return new NextResponse("No Signature Found", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Stripe webhook is not set", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(`Webhook Error: ${error}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;
      // get firebase user details from stripe customer Id
      const userDetails = await getUserDetails(customerId);
      if (!userDetails?.id) {
        return new NextResponse("User not found", { status: 404 });
      }
      // update the user's subscription status
      await adminDb.collection("users").doc(userDetails.id).update({
        membershipLevel: "pro",
      });
      break;
    }

    case "subscription_schedule.canceled":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      // get firebase user details from stripe customer Id
      const userDetails = await getUserDetails(customerId);
      if (!userDetails?.id) {
        return new NextResponse("User not found", { status: 404 });
      }
      // update the user's subscription status
      await adminDb.collection("users").doc(userDetails.id).update({
        membershipLevel: "starter",
      });
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ message: "webhook recieved" });
}
