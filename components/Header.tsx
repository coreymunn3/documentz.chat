"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { FilePlus2 } from "lucide-react";

const Header = () => {
  return (
    <div className="p-4 border-b border-b-slate-200 bg-slate-50">
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
              <Button asChild variant="link" className="hidden md:flex">
                <Link href={"/dashboard/upgrade"}>Pricing</Link>
              </Button>
              {/* my documents */}
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/dashboard">My Documents</Link>
              </Button>
              {/* create new document */}
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-primary"
              >
                <Link href="/dashboard/upload">
                  <FilePlus2 />
                </Link>
              </Button>
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
