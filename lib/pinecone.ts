import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
  throw new Error("Pinecone API key or Index Name not set");
}

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export default pc;
