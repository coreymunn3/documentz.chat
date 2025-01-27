"use client";

import { Button } from "./ui/button";
import useSubscription from "@/hooks/useSubscription";
import Link from "next/link";
import { createStripePortal } from "@/actions/createStripePortal";
import { useRouter } from "next/navigation";
import { startTransition, useTransition } from "react";
import { Loader2Icon, StarIcon } from "lucide-react";

const UpgradeButton = () => {
  const router = useRouter();
  const { membershipLevel, userLoading } = useSubscription();
  const [isPending, startTransition] = useTransition();

  const handleAccount = () => {
    startTransition(async () => {
      const portalUrl = await createStripePortal();
      router.push(portalUrl);
    });
  };

  if (userLoading) {
    <Button>
      <Loader2Icon className="animate-spin" />
    </Button>;
  }
  if (membershipLevel === "starter") {
    return (
      <Button asChild>
        <Link href="/dashboard/upgrade">
          Upgrade <StarIcon className="ml-3 fill-primary text-white" />{" "}
        </Link>
      </Button>
    );
  }
  if (membershipLevel === "pro")
    return (
      <Button onClick={handleAccount} disabled={isPending}>
        {isPending ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          membershipLevel && (
            <span className="font-bolt">{`${
              // capitalize it
              (membershipLevel as string).charAt(0).toUpperCase() +
              (membershipLevel as string).slice(1).toLowerCase()
            } Account`}</span>
          )
        )}
      </Button>
    );
};
export default UpgradeButton;
