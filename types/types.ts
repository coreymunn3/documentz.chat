import { Document } from "@langchain/core/documents";

export type Message = {
  id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  sources: string[] | null;
  createdAt: Date;
};

export type UserDetails = {
  email: string;
  name: string;
};

export type AiResponseContext = {
  id: string;
  pageContent: string;
  metadata: object;
};
