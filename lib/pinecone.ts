import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("Pinecone API key not set");
}

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export default pc;
