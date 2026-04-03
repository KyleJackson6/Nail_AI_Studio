import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, colors, shape, length } = await req.json();

    const colorList =
      Array.isArray(colors) && colors.length > 0
        ? colors.join(", ")
        : "No specific colors provided";

    const response = await openai.responses.create({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini",
      input: `
You are a helpful nail assistant chatbot.

The user's available colors are:
${colorList}

Preferred shape:
${shape || "Any"}

Preferred length:
${length || "Any"}

User question:
${message}

Give a helpful, pretty, well-structured answer.
Use short paragraphs or numbered suggestions when useful.
If recommending designs, prefer the available colors, selected shape, and selected length.
      `,
    });

    return NextResponse.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get chatbot reply." },
      { status: 500 }
    );
  }
}