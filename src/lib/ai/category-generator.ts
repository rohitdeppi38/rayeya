import { z } from "zod";
import { db } from "../db";
import { CATEGORY_GENERATOR_SYSTEM_PROMPT } from "./prompts";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const CategoryResultSchema = z.object({
    primaryCategory: z.string(),
    subCategory: z.string(),
    seoTags: z.array(z.string()),
    sustainabilityFilters: z.array(z.string()),
});

export type CategoryResult = z.infer<typeof CategoryResultSchema>;

export async function generateCategoryAction(productId: string, productDescription: string) {
    const startTime = Date.now();
    let resultJSON: string | null = null;

    try {
        const apiKey = process.env.OPENAI_API_KEY || "";
        if (!apiKey.startsWith("sk-") && !apiKey.startsWith("proj-")) {
            // MOCK FALLBACK
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockData = {
                primaryCategory: "Home & Garden",
                subCategory: "Eco-Friendly Living",
                seoTags: ["sustainable", "zero-waste", "eco-friendly", "bamboo", "plastic-free"],
                sustainabilityFilters: ["plastic-free", "compostable", "biodegradable", "organic"]
            };

            const durationMs = Date.now() - startTime;
            const savedRecord = await db.saveCategory({
                productId,
                originalText: productDescription,
                ...mockData
            });

            return { success: true, data: savedRecord, durationMs };
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: CATEGORY_GENERATOR_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Analyze the following product description:\n\n"${productDescription}"\n\nReturn the categorization as structured JSON.`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2, // Low temperature for more deterministic categorization
        });

        resultJSON = response.choices[0].message.content;
        if (!resultJSON) {
            throw new Error("Empty response from AI");
        }

        // Attempt to parse and validate against our schema
        const parsedData = JSON.parse(resultJSON);
        const validatedData = CategoryResultSchema.parse(parsedData);

        const durationMs = Date.now() - startTime;

        // Save prompt & response log
        await db.saveLog({
            moduleId: "auto-category-tag-generator",
            prompt: productDescription,
            response: validatedData,
            durationMs
        });

        // Save generated category to DB
        const savedRecord = await db.saveCategory({
            productId,
            originalText: productDescription,
            ...validatedData
        });

        return { success: true, data: savedRecord, durationMs };

    } catch (error: unknown) {
        const durationMs = Date.now() - startTime;
        console.error("AI Category Generation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Log failures as well if needed
        await db.saveLog({
            moduleId: "auto-category-tag-generator",
            prompt: productDescription,
            response: { error: errorMessage, raw: resultJSON },
            durationMs
        });

        return {
            success: false,
            error: error instanceof z.ZodError ? "Failed to validate AI output format." : "Failed to generate category.",
            details: errorMessage
        };
    }
}
