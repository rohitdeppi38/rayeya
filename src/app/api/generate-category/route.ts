import { NextResponse } from "next/server";
import { generateCategoryAction } from "@/lib/ai/category-generator";
import { z } from "zod";

const RequestSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    productDescription: z.string().min(10, "Description must be at least 10 characters long"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate request body
        const { productId, productDescription } = RequestSchema.parse(body);

        // Call AI Service
        const result = await generateCategoryAction(productId, productDescription);

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
