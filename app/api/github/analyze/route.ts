import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/app/lib/gemini";

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

    const gemini = getGeminiClient();

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
    });

    return NextResponse.json({
      answer: response.text,
      fallback: false,
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    const message =
      error instanceof Error ? error.message : "AI request failed";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}