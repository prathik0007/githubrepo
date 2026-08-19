import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/app/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const question = body.question;

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: question,
    });

    return NextResponse.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "AI request failed";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}