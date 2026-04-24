import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `Siz Grow.UZ platformasining rasmiy AI Mentor isisiz. Sizning maqsadingiz yoshlarga (asosan maktab va universitet talabalari) 'soft skills' ya'ni 'yumshoq ko'nikmalar'ni urgatish: vaqtni boshqarish, ommaviy nutq, yetakchilik, jamoaviy ishlash va h.k. Doim samimiy, tushunarli va ruhlantiruvchi tilda o'zbek tilida javob bering. Javoblaringizni Markdown formatida qulay va chiroyli tartibda taqdim eting.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API kaliti sozlanmagan' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Xabar bo\'sh bo\'lmasligi kerak' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: formattedHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const response = await chat.sendMessage({ message });

    return NextResponse.json({
      text: response.text,
    });
  } catch (error: any) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}
