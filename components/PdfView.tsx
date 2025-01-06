"use client";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { Document, Page, pdfjs } from "react-pdf";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2Icon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "./ui/button";

// configure CORS
// gsutil cors set cors.json gs://documentz-chat.firebasestorage.app
// in google cloud console create new file in editor called cors.json
// run the command above

// pull in the service worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfView = ({ url }: { url: string }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [file, setFile] = useState<Blob | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);

  /**
   * This useEffect fetches the URL
   */
  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(url);
        const file = await response.blob();
        setFile(file);
        setFileLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Unable to retrieve PDF");
      }
    };
    setFileLoading(true);
    fetchFile();
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  function nextPage() {
    setPageNumber((v) => ++v);
  }
  function prevPage() {
    setPageNumber((v) => --v);
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="sticky top-0 bg-slate-100 p-4 rounded-b-lg z-10 w-full">
        <div className="flex space-x-2 items-center max-w-xl mx-auto">
          <Button
            variant={"outline"}
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((prev) => prev - 1)}
          >
            Previous
          </Button>

          <p className="text-slate-500">
            Page {pageNumber} of {numPages}
          </p>

          <Button
            variant={"outline"}
            disabled={pageNumber === numPages}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Next
          </Button>

          <div className="mr-4" />

          <Button
            variant={"outline"}
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
          >
            Rotate
          </Button>

          <Button
            variant={"outline"}
            disabled={scale >= 1.5}
            onClick={() => setScale((prev) => prev * 1.2)}
          >
            <ZoomInIcon />
          </Button>

          <Button
            variant={"outline"}
            disabled={scale <= 0.5}
            onClick={() => setScale((prev) => prev / 1.2)}
          >
            <ZoomOutIcon />
          </Button>
        </div>
      </div>
      {fileLoading && !file ? (
        <Loader2Icon className="animate-spin h-20 w-20 text-primary mt-20" />
      ) : (
        <Fragment>
          <Document
            className="m-4 overflow-scroll shadow-lg"
            loading={null}
            file={url}
            rotate={rotation}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </Fragment>
      )}
    </div>
  );
};
export default PdfView;
