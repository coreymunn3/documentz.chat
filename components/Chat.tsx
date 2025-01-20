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
import { saveChatMessage } from "@/actions/saveChatMessage";
import { debounce } from "lodash";

const Chat = ({ id }: { id: string }) => {
  const { user } = useUser();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [currentSources, setCurrentSources] = useState<AiResponseContext[]>([]);
  const bottomChatRef = useRef<HTMLDivElement>(null);

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user.id, "files", id, "chat"),
        orderBy("createdAt", "asc")
      )
  );

  const debouncedSaveResponse = debounce(async () => {
    if (currentResponse) {
      const aiResponse: Message = {
        role: "ai",
        sources: currentSources.map((s) => s.pageContent),
        message: currentResponse,
        createdAt: new Date(),
      };
      await saveChatMessage(id, aiResponse);
      // clean up current response and current sources
      setCurrentResponse("");
      setCurrentSources([]);
    }
  }, 1000);

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

  useEffect(() => {
    debouncedSaveResponse();
    // clean up
    return () => {
      debouncedSaveResponse.cancel();
    };
  }, [currentResponse, currentSources, id]);

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

    // ask the question and stream the response
    const aiCompletionUrl = `/api/askQuestion?docId=${encodeURIComponent(
      id
    )}&question=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(aiCompletionUrl);
      // Handle streamed responses
      const eventSource = new EventSource(aiCompletionUrl);
      // on message
      eventSource.onmessage = async function (event) {
        // parse the event data
        const { data, end } = JSON.parse(event.data);
        // if the event stream data object contains parts of the 'answer' add that to the ongoing response
        if (data?.answer) {
          setCurrentResponse((prev) => (prev += data.answer));
        }
        // if the event stream contains context, add that to sources
        if (data?.context) {
          setCurrentSources(data.context);
        }
        /**
         * When the stream is done, we need to save the human question and the ai response
         * we can must save the human question here, because the input has already been cleared
         *
         * for the ai response, we must trigger the currentResponse state to save the final full result,
         * and when that's done, the useEffect above will trigger allowing us to save that full response to the DB as well
         * NOTE: we are unable to save here bencause the react state has not yet been updated, se if we save here we would get an empty message
         */
        if (end) {
          eventSource.close();
          // save human query & ai response to database
          const humanQuestion: Message = {
            role: "human",
            message: q,
            sources: null,
            createdAt: new Date(),
          };
          await saveChatMessage(id, humanQuestion);
          ``;
          // trigger one final state change. The debounced useEffect above will save the AI response
          // and clear currentResponse after this operation is complete.
          setCurrentResponse((prev) => prev);
          try {
          } catch (error) {
            console.error("Error with the stream:", error);
          }
        }
      };
      // on error
      eventSource.onerror = function (err) {
        console.error("Error with EventSource:", err);
        eventSource.close();
      };
      // on open - currently no need for this
      // eventSource.onopen = function () {};
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
                        ? currentSources.map((c) => c.pageContent)
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
        <Button type="submit" disabled={!input}>
          "Ask"
        </Button>
      </form>
    </div>
  );
};
export default Chat;
