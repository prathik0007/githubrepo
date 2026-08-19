import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "GitHub API route is working!",
  });
}