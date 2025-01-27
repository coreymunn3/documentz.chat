"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { FilePlus2 } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import UpgradeButton from "./UpgradeButton";

const Header = () => {
  return (
    <div className="p-4 border-b border-b-slate-200 bg-slate-50 dark:border-b-slate-700 dark:bg-primary/5">
      <div className="flex justify-between mx-auto max-w-6xl">
        <Link href="/dashboard">
          <p className="text-2xl font-light">
            Documentz
            <span className="text-primary font-bold italic">{`.chat`}</span>
          </p>
        </Link>

        <div>
          <SignedIn>
            <div className="flex gap-2 items-center">
              {/* pricing */}
              <Button
                asChild
                variant="link"
                className="hidden md:flex dark:text-white"
              >
                <Link href={"/dashboard/upgrade"}>Pricing</Link>
              </Button>
              {/* my documents */}
              <Button
                asChild
                variant="ghost"
                className="hidden md:flex bg-transparent"
              >
                <Link href="/dashboard">My Documents</Link>
              </Button>
              {/* create new document */}
              <Button
                asChild
                variant="ghost"
                className="bg-transparent border-primary hidden md:flex"
              >
                <Link href="/dashboard/upload">
                  <FilePlus2 />
                </Link>
              </Button>
              {/* upgrade */}
              <UpgradeButton />
              {/* dark mode */}
              <DarkModeToggle />
              {/* current account status - pro vs free */}
              {/* TO DO */}

              {/* user account button */}
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default Header;
