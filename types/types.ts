import { Timestamp } from "firebase/firestore";

export type Message = {
  id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  sources: string[] | null;
  createdAt: Date | Timestamp;
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
