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

const ChatMessage = ({
  message,
  sources,
}: {
  message: Message;
  sources: string[];
}) => {
  const { user } = useUser();
  const isHuman = message.role === "human";

  return (
    <div className={`chat ${isHuman ? "chat-end" : "chat-start"}`}>
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
            <Accordion type="single" collapsible className="w-full">
              {sources.length > 0 &&
                sources.map((source, index) => (
                  <AccordionItem value={`source-${index}`} key={index}>
                    <AccordionTrigger>{`Source ${index + 1}`}</AccordionTrigger>
                    <AccordionContent>
                      <Markdown>{formattedSourceText(source)}</Markdown>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatMessage;
