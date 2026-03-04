import { NextResponse } from "next/server";
import { generateProposalAction } from "@/lib/ai/proposal-generator";
import { z } from "zod";

const RequestSchema = z.object({
    clientId: z.string().min(1, "Client ID is required"),
    clientRequest: z.string().min(10, "Request details must be at least 10 characters long"),
    maxBudget: z.number().positive("Budget must be a positive number"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { clientId, clientRequest, maxBudget } = RequestSchema.parse(body);

        const result = await generateProposalAction(clientId, clientRequest, maxBudget);

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
