"use client";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { DownloadCloudIcon, PlusCircleIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { DocumentData } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";
import byteSize from "byte-size";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const placeholderDocuments = [
  {
    filename: "sample-essay-1.pdf",
    filesize: "298kb",
  },
  {
    filename: "The_Code_Whisperers_Quest.pdf",
    filesize: "2.4kb",
  },
];

const Documents = () => {
  const router = useRouter();
  const { user } = useUser();
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user.id, "files"),
        orderBy("createdAt", "desc")
      )
  );

  /**
   * format user docs from a snapshot to the actual data
   */
  useEffect(() => {
    if (snapshot) {
      setDocuments(
        snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
      );
    }
  }, [snapshot]);

  const handleAddDocument = () => {
    // eventually, check if user is free tier, if they are over file limit, push to upgrade screen
    router.push("/dashboard/upload");
  };

  return (
    <div className="flex  flex-wrap">
      {/* loading skeletons */}
      {loading && (
        <div className="flex space-x-2">
          <Skeleton className="h-80 w-64 rounded-xl" />
          <Skeleton className="h-80 w-64 rounded-xl" />
          <Skeleton className="h-80 w-64 rounded-xl" />
        </div>
      )}
      {/* render the add document button first */}
      <Button
        className="flex flex-col items-center justify-center w-64 h-80 rounded-xl drop-shadow-md mr-2 mb-2 text-slate-400 bg-slate-200 hover:text-white dark:bg-slate-700 hover:dark:bg-slate-600"
        onClick={handleAddDocument}
      >
        <PlusCircleIcon className="h-16 w-16" />
        Add A Document
      </Button>
      {/* render out the documents */}
      {documents.map((doc) => (
        <Button
          key={doc.data.name}
          variant="ghost"
          // navigate to the file page
          onClick={() => router.push(`dashboard/files/${doc.id}`)}
          className="w-64 h-80 rounded-xl drop-shadow-md flex flex-col items-start justify-between mr-2 mb-2  bg-white hover:bg-slate-100 dark:bg-slate-800 hover:dark:bg-slate-700"
        >
          <div className="text-left">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="w-56 overflow-hidden text-ellipsis">
                    {doc.data.name}
                  </p>
                </TooltipTrigger>
                <TooltipContent>{doc.data.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <p className="font-extralight text-slate-400">
              {byteSize(doc.data.size).value} kB
            </p>
          </div>
          <div className="flex flex-row space-x-2 w-full justify-end">
            {/* download */}
            <Button variant="ghost">
              <DownloadCloudIcon />
            </Button>
            {/* delete */}
            <Button variant="ghost" className="text-destructive">
              <Trash2 />
            </Button>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default Documents;
