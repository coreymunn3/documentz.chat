import { Document } from "@langchain/core/documents";

export type Message = {
  id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  sources: string[] | null;
  createdAt: Date;
};
