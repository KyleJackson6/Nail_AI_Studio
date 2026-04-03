import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, colors, shape, length } = await req.json();

    const colorList =
      Array.isArray(colors) && colors.length > 0
        ? colors.join(", ")
        : "No specific colors provided";

    const response = await openai.responses.create({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini",
      input: `
You are a nail design assistant.

The user wants nail ideas based on this request:
"${prompt}"

Only use these available nail colors:
${colorList}

Preferred nail shape:
${shape || "Any"}

Preferred nail length:
${length || "Any"}

Use the preferred shape and length for all ideas unless the request strongly requires a different option.

Return exactly 3 nail ideas in valid JSON format like this:
{
  "ideas": [
    {
      "title": "string",
      "description": "string",
      "colorsUsed": ["string"],
      "shape": "string",
      "length": "string"
    }
  ]
}
      `,
      text: {
        format: {
          type: "json_object",
        },
      },
    });

    const text = response.output_text || "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Design generation error:", error);

    if (error?.status === 429 || error?.code === "insufficient_quota") {
      return NextResponse.json(
        {
          error:
            "Design generation is unavailable right now because the API quota has been exceeded.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate nail ideas." },
      { status: 500 }
    );
  }
}