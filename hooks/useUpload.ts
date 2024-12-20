"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { db, storage } from "@/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { generateEmbeddings } from "@/actions/generateEmbedding";

export enum StatusText {
  UPLOADING = "Uploading file...",
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file to database...",
  GENERATING = "Generating AI Embeddings...",
}

export type Status = StatusText[keyof StatusText];

const useUpload = () => {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<{
    message: string;
    uploadProgress: number;
    error: any;
  } | null>(null);
  const { user } = useUser();
  const router = useRouter();

  // for details and example, see https://firebase.google.com/docs/storage/web/upload-files
  const handleUpload = async (file: File) => {
    if (!file || !user) return;
    // Free/Pro plan limitations TODO

    const fileId = uuidV4();
    const storageRef = ref(storage, `users/${user.id}/files/${fileId}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    // listen for state changes, errors, and completion
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // get task progress
        const progressPct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setStatus(StatusText.UPLOADING);
        setProgress(progressPct);
      },
      // on error
      (error) => {
        console.error("Error encountered uploading file", error);
        setError({ message: "Error uploading file", uploadProgress: 0, error });
      },
      // on complete
      async () => {
        // first get the download URL
        setStatus(StatusText.UPLOADED);
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

        // save the file location in the firestore database
        setStatus(StatusText.SAVING);
        try {
          await setDoc(doc(db, "users", user.id, "files", fileId), {
            name: file.name,
            size: file.size,
            downloadUrl,
            ref: uploadTask.snapshot.ref.fullPath,
            createdAt: new Date(),
          });
        } catch (error) {
          setError({
            message: "Error saving file metadata in firesstore",
            uploadProgress: 0,
            error,
          });
        }

        // generate AI embeddings
        setStatus(StatusText.GENERATING);
        try {
          await generateEmbeddings(fileId);
        } catch (error) {
          setError({
            message:
              "Error generating vector embeddings. You will be able to view and read this document, but AI functionality has been disabled.",
            uploadProgress: 100,
            error,
          });
        }

        setFileId(fileId);
      }
    );
  };

  return { progress, status, fileId, error, handleUpload };
};

export default useUpload;
