"use client";
import useUpload from "@/hooks/useUpload";
import { CircleArrowDown, FrownIcon, RocketIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import useSubscription from "@/hooks/useSubscription";
import { Progress } from "./ui/progress";
import { toast } from "sonner";

const FileUploader = () => {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { membershipLevel, isOverDocumentLimit, filesLoading } =
    useSubscription();

  // run this when the upload completes
  const { progress, status, fileId, error, handleUpload } = useUpload();
  // when the file upload is complete, and we have a fileId, push the user to that page
  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
    if (error) {
      setUploadProgress(error.uploadProgress);
      toast.error(`${error.message}`);
    }
  }, [fileId, error]);

  // determinant progress simulation
  const startSimulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        // don't go past 95
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        } else {
          return prev + 5;
        }
      });
    }, 100);
    return interval;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // only handle the upload if we're not over the file limit
    if (!isOverDocumentLimit && !filesLoading) {
      startSimulateProgress();
      // if there's a file, attempt to upload
      const file = acceptedFiles[0];
      if (file) {
        await handleUpload(file);
      }
    } else {
      toast.error(
        `You have already met or exceeded the document limit of your ${membershipLevel} plan. Upgrade to upload additional documentss`
      );
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
      },
      maxFiles: 1,
    });

  const uploadInProgress =
    progress !== null && progress >= 0 && progress <= 100;

  return (
    <div className="flex flex-col items-center max-w-6xl mx-auto min-h-1">
      {/* the determinante status bar that goes along the top */}
      <div className="h-1 w-full">
        {uploadInProgress && (
          <Progress value={uploadProgress} className="w-full h-1" />
        )}
      </div>
      {/* the big drop-zone component */}
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed mt-10 cursor-pointer 
            w-[90%] rounded-xl h-96 flex items-center justify-center
            border-primary dark:border-slate-500 transition-colors duration-300  
            ${
              isFocused || isDragAccept
                ? "bg-primary/10 text-primary dark:bg-slate-800 dark:text-indigo-400"
                : "bg-primary/5 text-slate-400 dark:bg-slate-800 dark:text-slate-300"
            }
                `}
      >
        <input {...getInputProps()} />
        {isDragActive && (
          <Fragment>
            <RocketIcon className="h-8 w-8 animate-ping mr-4" />
            <p>Drop the files here ...</p>
          </Fragment>
        )}
        {uploadInProgress && status && <p>{status}</p>}
        {!isDragActive && !uploadInProgress && !isOverDocumentLimit && (
          <Fragment>
            <CircleArrowDown className="h-8 w-8 animate-pulse mr-4" />
            <p>Drag & drop some files here, or click to select files</p>
          </Fragment>
        )}
        {!isDragActive && !uploadInProgress && isOverDocumentLimit && (
          <Fragment>
            <FrownIcon className="h-8 w-8 animate-pulse mr-4" />
            <p>{`You have already met or exceeded the document limit of your ${membershipLevel} plan. Upgrade to upload additional documentss`}</p>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
