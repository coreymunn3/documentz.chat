"use client";

import { useUser } from "@clerk/nextjs";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { AiResponseContext, Message } from "@/types/types";
import ChatMessage from "./ChatMessage";

const Chat = ({ id }: { id: string }) => {
  const { user } = useUser();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [currentSources, setCurrentSources] = useState<AiResponseContext[]>([]);
  const [isPending, startTransition] = useTransition();
  const bottomChatRef = useRef<HTMLDivElement>(null);

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user.id, "files", id, "chat"),
        orderBy("createdAt", "asc")
      )
  );

  /**
   * This useEffect formats every new message, unpacking the role, message and createdAt and combining with the ID
   */
  useEffect(() => {
    if (!snapshot) return;
    // format messages
    const newMessages = snapshot.docs.map((doc) => {
      const { role, message, sources, createdAt } = doc.data();
      return {
        id: doc.id,
        role,
        message,
        sources,
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

  /**
   * This function runs whenever the user enters and submits a new chat
   * It optimistically updates the UI with a "thinking" message then attempts to ask the question
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // prevent empty messages
    if (!input.trim()) return;
    // get the question and clear the input
    const q = input;
    setInput("");
    // create the user message
    setMessages((prev) => [
      ...prev,
      {
        role: "human",
        message: q,
        sources: null,
        createdAt: new Date(),
      },
    ]);

    // Ask the question to the model
    // startTransition(async () => {
    //   const { success, message } = await askQuestion(id, q);

    //   if (!success) {
    //     // ...toast
    //     setMessages((prev) =>
    //       prev.slice(0, prev.length - 1).concat([
    //         {
    //           role: "ai",
    //           message: "Whoops! An error occurred." + message,
    //           sources: [],
    //           createdAt: new Date(),
    //         },
    //       ])
    //     );
    //   }
    // });

    // ask the question and stream the response
    const aiCompletionUrl = `/api/askQuestion?docId=${encodeURIComponent(
      id
    )}&question=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(aiCompletionUrl);
      // Handle streamed responses
      const eventSource = new EventSource(aiCompletionUrl);
      // on message
      eventSource.onmessage = function (event) {
        // parse the event data
        console.log(JSON.parse(event.data));
        const { data, end } = JSON.parse(event.data);
        // if the event stream data object contains parts of the 'answer' add that to the ongoing response
        if (data?.answer) {
          setCurrentResponse((prev) => (prev += data.answer));
        }
        // if the event stream contains context, add that to sources
        if (data?.context) {
          setCurrentSources(data.context);
        }
        // if the stream is done...
        if (end) {
          console.log("stream finished");
          eventSource.close();
          // then, save to database
        }
      };
      // on error
      eventSource.onerror = function (err) {
        console.error("Error with EventSource:", err);
        eventSource.close();
      };
      // on open
      // eventSource.onopen = function () {};

      if (res.ok) {
        // save the message
      } else {
        // send a toast
      }
    } catch (error) {
      console.error("Error in question ask:", error);
    }
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
                    sources: null,
                    createdAt: new Date(),
                  }}
                />
              )}
              {messages.length > 0 &&
                messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              {currentResponse && (
                <ChatMessage
                  key="0"
                  message={{
                    id: "0",
                    role: "ai",
                    message: currentResponse,
                    sources:
                      currentSources.length > 0
                        ? currentSources.slice(0, 2).map((c) => c.pageContent)
                        : null,
                    createdAt: new Date(),
                  }}
                />
              )}
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
