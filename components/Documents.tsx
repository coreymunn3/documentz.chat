"use client";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { DownloadCloudIcon, PlusCircleIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const handleAddDocument = () => {
    // eventually, check if user is free tier, if they are over file limit, push to upgrade screen
    router.push("/dashboard/upload");
  };

  return (
    <div className="flex  flex-wrap">
      {/* render out the documents */}
      {placeholderDocuments.map((doc) => (
        <Button
          variant="ghost"
          className="w-64 h-80 rounded-xl drop-shadow-md flex flex-col items-start justify-between mr-2 mb-2  bg-white hover:bg-slate-100 dark:bg-slate-800 hover:dark:bg-slate-700"
        >
          <div className="text-left">
            <p className="">{doc.filename}</p>
            <p className="font-extralight text-slate-400">{doc.filesize}</p>
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
      {/* render the add document button */}
      <Button
        className="flex flex-col items-center justify-center w-64 h-80 rounded-xl drop-shadow-md text-slate-400 bg-slate-200 hover:text-white dark:bg-slate-700 hover:dark:bg-slate-600"
        onClick={handleAddDocument}
      >
        <PlusCircleIcon className="h-16 w-16" />
        Add A Document
      </Button>
    </div>
  );
};

export default Documents;
