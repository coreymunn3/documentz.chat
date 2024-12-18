"use client";
import { CircleArrowDown, RocketIcon } from "lucide-react";
import { Fragment, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const FileUploader = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
    });

  return (
    <div className="flex flex-col gap-4 items-center max-w-6xl mx-auto">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed mt-10 
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
        {isDragActive ? (
          <Fragment>
            <RocketIcon className="h-8 w-8 animate-ping mr-4" />
            <p>Drop the files here ...</p>
          </Fragment>
        ) : (
          <Fragment>
            <CircleArrowDown className="h-8 w-8 animate-pulse mr-4" />
            <p>Drag 'n' drop some files here, or click to select files</p>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
