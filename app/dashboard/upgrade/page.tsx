"use client";

import { createCheckoutSession } from "@/actions/createCheckoutSession";
import { createStripePortal } from "@/actions/createStripePortal";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";
import getStripe from "@/lib/get-stripejs";
import { UserDetails } from "@/types/types";
import { useUser } from "@clerk/nextjs";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const PricingPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const { membershipLevel, userLoading } = useSubscription();
  console.log("my membership", membershipLevel);
  const [isPending, startTransition] = useTransition();

  const handleChangeMembership = async () => {
    if (!user) return;

    const userDetails: UserDetails = {
      email: user.primaryEmailAddress?.toString()!,
      name: user.fullName!,
    };

    startTransition(async () => {
      // load stripe
      const stripe = await getStripe();
      // If the user has a paid membership level, allow them to access the stripe portal
      // to change/manage their membership level
      // pro, or any other paid levels (currently only pro)
      if (membershipLevel === "pro") {
        console.log("here");
        const stripePortalUrl = await createStripePortal();
        return router.push(stripePortalUrl);
      } else {
      /**
       * otherwise create a checkout session & redirect user to that checkout
       */
        const sessionId = await createCheckoutSession(userDetails);
        await stripe?.redirectToCheckout({
          sessionId,
        });
      }
    });
  };

  return (
    <div>
      <div className="py-24 sm:py-32 px-2">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
            Supercharge your document companion
          </p>
        </div>

        <p className="mx-auto max-w-4xl mt-6 px-10 text-center text-lg leading-8 text-gray-600 dark:text-gray-400">
          Choose an affordable plan that's packed with the best features for
          interacting with your PDF's, enhancing productivity, and steamlining
          your workflow
        </p>

        {/* pricing boxes */}
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* free plan */}
          <div className="h-full ring-1 ring-gray-200 p-8 pb-12 rounded-3xl">
            <h3 className="text-lg font-bold leading-8 text-gray-900 dark:text-gray-200">
              Starter Plan
            </h3>
            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Explore core features at No Cost
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Free
              </span>
            </p>
            <ul
              role="list"
              className="mt-8 space-y-3 text-sm text-gray-600 dark:text-gray-400"
            >
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-6 flex-none text-primary" />2
                Documents
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-6 flex-none text-primary" />
                Up to 3 messages per document
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-6 flex-none text-primary" />
                AI Chat functionality
              </li>
            </ul>
          </div>
          {/* pro plan */}
          <div className="ring-2 ring-primary/60 p-8 h-full pb-12 rounded-3xl">
            <h3 className="text-lg font-bold leading-8 text-gray-900 dark:text-gray-200">
              Pro Plan
            </h3>
            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Maximize Productivity with PRO features
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                $5.99
              </span>
              <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                /month
              </span>
            </p>

            <Button
              disabled={userLoading || isPending}
              onClick={handleChangeMembership}
              className="w-full text-white shadow-md mt-6 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {membershipLevel === "pro" ? "Manage My Plan" : "Become a Pro"}
              {(isPending || userLoading) && (
                <Loader2Icon className="animate-spin" />
              )}
            </Button>
            <ul
              role="list"
              className="mt-8 space-y-3 text-sm text-gray-600 dark:text-gray-400"
            >
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-6 flex-none text-primary" />
                20 Documents
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-6 flex-none text-primary" />
                Ability to Delete Documents
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-6 flex-none text-primary" />
                Up to 100 Messages per Document
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-6 flex-none text-primary" />
                Advanced Analytics
              </li>
              <li className="flex gap-x-3">
                <CheckIcon className="h-6 w-6 flex-none text-primary" />
                24-hour response time
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PricingPage;
