import { NextResponse } from "next/server";
import { generateImpactReportAction } from "@/lib/ai/impact-generator";
import { z } from "zod";

const OrderItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number().positive(),
    material: z.enum(["bamboo", "recycled_paper", "glass", "cotton", "other"]),
    origin: z.enum(["local", "international"]),
});

const RequestSchema = z.object({
    orderId: z.string().min(1),
    region: z.string().min(1),
    items: z.array(OrderItemSchema).min(1),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { orderId, region, items } = RequestSchema.parse(body);

        const result = await generateImpactReportAction(orderId, items, region);

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
