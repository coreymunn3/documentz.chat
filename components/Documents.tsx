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
          className="w-64 h-80 rounded-xl bg-white drop-shadow-md flex flex-col items-start justify-between mr-2 mb-2 hover:bg-slate-100"
        >
          <div className="text-left">
            <p className="">{doc.filename}</p>
            <p className="font-extralight text-slate-400">{doc.filesize}</p>
          </div>
          <div className="flex flex-row space-x-2 w-full justify-end">
            {/* download */}
            <Button variant="outline">
              <DownloadCloudIcon />
            </Button>
            {/* delete */}
            <Button
              variant="outline"
              className="border border-destructive text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        </Button>
      ))}
      {/* render the add document button */}
      <Button
        className="flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-slate-200 drop-shadow-md text-slate-400 hover:text-white"
        onClick={handleAddDocument}
      >
        <PlusCircleIcon className="h-16 w-16" />
        Add A Document
      </Button>
    </div>
  );
};

export default Documents;
