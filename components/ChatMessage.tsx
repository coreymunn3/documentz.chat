"use client";

import { Message } from "@/types/types";
import { useUser } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import Markdown from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { formattedSourceText } from "@/lib/utils";
import { DateTime } from "luxon";
import { Timestamp } from "firebase/firestore";

const ChatMessage = ({ message }: { message: Message }) => {
  const { user } = useUser();
  const isHuman = message.role === "human";
  // get the created at date for this message - which will be a Firebase Timestamp :/ fuck you firebase
  const messageDate =
    message.createdAt instanceof Timestamp
      ? message.createdAt.toDate()
      : message.createdAt;
  console.log(messageDate);
  // convert message date to relative time
  const relativeMessageDate = DateTime.fromJSDate(messageDate).toRelative();

  return (
    <div className={`chat ${isHuman ? "chat-end" : "chat-start"} mb-2`}>
      <div className="chat-image avatar">
        <div>
          {isHuman ? (
            user?.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="profile picture"
                width={40}
                height={40}
                className="rounded-full"
              />
            )
          ) : (
            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 flex items-center justify-center rounded-full text-2xl">
              🤖
            </div>
          )}
        </div>
      </div>
      <div
        className={`chat-bubble prose ${
          isHuman && "bg-primary/60 text-white dark:bg-primary"
        } ${
          !isHuman &&
          "bg-slate-200 text-black dark:bg-slate-700 dark:text-white"
        }`}
      >
        {message.message === "Thinking..." ? (
          <div className="flex items-center justify-center">
            <Loader2Icon className="animate-spin h-5 w-5 text-white" />
          </div>
        ) : (
          <div>
            <Markdown>{message.message}</Markdown>
            {/* If there are sources, show them to the user for quick reference */}
            {/* <Accordion type="single" collapsible className="w-full">
              {message.sources &&
                message.sources.map((source, index) => (
                  <AccordionItem value={`source-${index}`} key={index}>
                    <AccordionTrigger>{`Source ${index + 1}`}</AccordionTrigger>
                    <AccordionContent>
                      <Markdown>{formattedSourceText(source)}</Markdown>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion> */}
          </div>
        )}
      </div>
      {/* time sent */}
      <small className="mt-1 text-slate-400">{relativeMessageDate}</small>
    </div>
  );
};
export default ChatMessage;
