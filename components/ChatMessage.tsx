"use client";

import { Message } from "@/types/types";
import { useUser } from "@clerk/nextjs";
import { BotIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import Markdown from "react-markdown";

const ChatMessage = ({ message }: { message: Message }) => {
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
          <Markdown>{message.message}</Markdown>
        )}
      </div>
    </div>
  );
};
export default ChatMessage;
