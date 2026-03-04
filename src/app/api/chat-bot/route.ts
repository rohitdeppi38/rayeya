import { NextResponse } from "next/server";
import { processWhatsAppMessage } from "@/lib/ai/whatsapp-bot";
import { z } from "zod";

const RequestSchema = z.object({
    sessionId: z.string().min(1),
    userMessage: z.string().min(1),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { sessionId, userMessage } = RequestSchema.parse(body);

        const result = await processWhatsAppMessage(sessionId, userMessage);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, details: result.details },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: result.data, durationMs: result.durationMs });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation Error", details: error.flatten() }, { status: 400 });
        }

        console.error("API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
