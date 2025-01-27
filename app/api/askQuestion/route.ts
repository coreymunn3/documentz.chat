import { NextRequest, NextResponse } from "next/server";
import { generateLangchainCompletion } from "@/lib/langchain";
import {
  getChatHistory,
  getMembershipLevelAndLimits,
} from "@/lib/firebaseUtils";

/**
 * This route generates the langchain completion given a question and a document ID and streams the response to the client
 * We are using a GET and not a POST because eventStream does not support POST requests
 * @param req NextRequest- must pass docId and question as query params
 * @returns ReadableStream instance
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const docId = searchParams.get("docId");
  const question = searchParams.get("question");

  if (!docId || !question) {
    return new NextResponse("Doc Id or Question missing from params", {
      status: 400,
    });
  }

  // Make sure user is under the messaging limit set for their plan.
  const { messageLimit, membershipLevel } = await getMembershipLevelAndLimits();
  const chatHistory = await getChatHistory(docId);
  const numHumanMessages = chatHistory.filter(
    (message) => message.role === "human"
  ).length;
  if (numHumanMessages >= messageLimit!) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: `${membershipLevel} plan messaging limit of ${messageLimit} exceeded`,
      }),
      { status: 403 }
    );
  }
  // try to generate the langchain completion and get the stream
  try {
    const stream = await generateLangchainCompletion(docId, question);
    // create a readable stream to stream the response
    const readableStream = new ReadableStream({
      start(controller) {
        (async () => {
          try {
            // For each chunk of data received from the Langchain stream, push it into the controller
            for await (const data of stream) {
              controller.enqueue(`data: ${JSON.stringify({ data })}\n\n`);
            }
            // Send an 'end' event to indicate the stream is complete
            controller.enqueue(`data: ${JSON.stringify({ end: true })}\n\n`);
            // Close the stream after the Langchain stream is finished
            controller.close();
          } catch (err) {
            console.error("Error streaming data: ", err);
            controller.error(err);
          }
        })();
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error generating Langchain completion: ", error);
    return new NextResponse("Failed to generate completion", { status: 500 });
  }
}
