"use client";

import { useUser } from "@clerk/nextjs";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { Message } from "@/types/types";
import { askQuestion } from "@/actions/askQuestion";
import ChatMessage from "./ChatMessage";

const Chat = ({ id }: { id: string }) => {
  const { user } = useUser();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  console.log("messages", messages);
  const [isPending, startTransition] = useTransition();
  const bottomChatRef = useRef<HTMLDivElement>(null);

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user.id, "files", id, "chat"),
        orderBy("createdAt", "asc")
      )
  );

  useEffect(() => {
    if (!snapshot) return;
    console.log("updated snapshot", snapshot.docs);
    // if the ai not thinking, remove the 'ai is thinking' placeholder
    const lastMessage = messages.pop();
    if (lastMessage?.role === "ai" && lastMessage.message === "Thinking...") {
      return;
    }
    const newMessages = snapshot.docs.map((doc) => {
      const { role, message, createdAt } = doc.data();
      return {
        id: doc.id,
        role,
        message,
        createdAt,
      };
    });
    setMessages(newMessages);
  }, [snapshot]);

  /**
   * This useEffect scrolls the chat window to the bottom if it is not currently in view
   * whenever a new message arrives
   */
  useEffect(() => {
    if (bottomChatRef.current) {
      bottomChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = input;
    setInput("");
    // create the messages, optimistically
    setMessages((prev) => [
      ...prev,
      {
        role: "human",
        message: q,
        createdAt: new Date(),
      },
      {
        role: "ai",
        message: "Thinking...",
        createdAt: new Date(),
      },
    ]);

    // Ask the question to the model
    startTransition(async () => {
      const { success, message } = await askQuestion(id, q);

      if (!success) {
        // ...toast
        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat([
            {
              role: "ai",
              message: "Whoops! An error occurred." + message,
              createdAt: new Date(),
            },
          ])
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full overflow-scroll">
      {/* chat messages */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2Icon className="animate-spin h-20 w-20 text-primary mt-20" />
          </div>
        ) : (
          <div className="p-4">
            <div>
              {messages.length === 0 && (
                <ChatMessage
                  message={{
                    id: "test",
                    role: "ai",
                    message: "Ask me Anything about the document!",
                    createdAt: new Date(),
                  }}
                />
              )}
              {messages.length > 0 &&
                messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
            </div>
            <div ref={bottomChatRef} />
          </div>
        )}
      </div>
      {/* input form to write new message */}
      <form
        onSubmit={handleSubmit}
        className="flex space-x-2 sticky bottom-0 p-5 bg-primary/25"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a Question..."
        />
        <Button type="submit" disabled={isPending || !input}>
          {isPending ? (
            <Loader2Icon className="animate-spin text-white" />
          ) : (
            "Ask"
          )}
        </Button>
      </form>
    </div>
  );
};
export default Chat;
