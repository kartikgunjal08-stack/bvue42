import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

// Initialize Groq with your key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { name, amt, country, currency } = await req.json();

    const prompt = `Act as a tax accountant. A user in ${country} spent ${currency}${amt} on "${name}". Is this a valid business deduction? Give a short, professional 1-sentence suggestion.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", // This is a fast, powerful open-source model
    });

    const suggestion = chatCompletion.choices[0]?.message?.content || "No suggestion found.";

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { suggestion: "AI service is currently unavailable." }, 
      { status: 500 }
    );
  }
}