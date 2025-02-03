"use client";
import { useEffect, useState, useTransition, Fragment } from "react";
import { Button } from "./ui/button";
import {
  DownloadCloudIcon,
  FrownIcon,
  Loader2Icon,
  PlusCircleIcon,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { DocumentData } from "firebase/firestore";
import useSubscription from "@/hooks/useSubscription";
import { Skeleton } from "./ui/skeleton";
import byteSize from "byte-size";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDocument } from "@/actions/deleteDocument";

const Documents = () => {
  const router = useRouter();
  const { user } = useUser();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const { membershipLevel, isOverDocumentLimit } = useSubscription();

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user.id, "files"),
        orderBy("createdAt", "desc")
      )
  );

  const [isDeleting, startTransition] = useTransition();

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
    if (isOverDocumentLimit) {
      router.push("/dashboard/upgrade");
    } else {
      router.push("/dashboard/upload");
    }
  };

  return (
    <div className="flex  flex-wrap">
      {/* loading skeletons */}
      {loading && (
        <div className="flex space-x-2 mr-2">
          <Skeleton className="h-80 w-64 rounded-xl bg-slate-200 animate-pulse" />
          <Skeleton className="h-80 w-64 rounded-xl bg-slate-200 animate-pulse" />
          <Skeleton className="h-80 w-64 rounded-xl bg-slate-200 animate-pulse" />
        </div>
      )}
      {/* render the add document button first */}
      <Button
        className="flex flex-col items-center justify-center w-64 h-80 rounded-xl drop-shadow-md mr-2 mb-2 text-slate-400 bg-slate-200 hover:text-white dark:bg-slate-700 hover:dark:bg-slate-600"
        onClick={handleAddDocument}
      >
        {isOverDocumentLimit ? (
          <FrownIcon className="h-20 w-20" />
        ) : (
          <PlusCircleIcon className="h-16 w-16" />
        )}

        <span>
          {isOverDocumentLimit
            ? "Upgrade to Add More Documents"
            : "Add A Document"}
        </span>
      </Button>
      {/* render out the documents */}
      {documents.map((doc) => (
        <div className="w-64 h-80 rounded-xl drop-shadow-md flex flex-col items-start justify-between mr-2 mb-2  bg-white hover:bg-slate-100 dark:bg-slate-800 hover:dark:bg-slate-700">
          <Button
            key={doc.data.name}
            variant="ghost"
            // navigate to the file page
            onClick={() => router.push(`dashboard/files/${doc.id}`)}
            className="pt-4 flex-1 w-full flex flex-col justify-start hover:bg-inherit"
          >
            <div className="text-left">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="w-56 overflow-hidden text-left text-ellipsis">
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
          </Button>
          <div className="flex flex-row space-x-2 w-full justify-end">
            {/* download */}
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <a href={doc.data.downloadUrl}>
                <DownloadCloudIcon />
              </a>
            </Button>
            {/* delete - only for paid plans */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    className="text-destructive"
                    disabled={isDeleting || membershipLevel === "starter"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                    }}
                  >
                    {isDeleting ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                  </Button>
                </TooltipTrigger>
                {membershipLevel === "starter" && (
                  <TooltipContent>This is a PRO feature</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* alert dialog for deleting */}
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your document and any related conversations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      startTransition(async () => {
                        await deleteDocument(doc.id);
                      });
                      setOpen(false);
                    }}
                  >
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Documents;
