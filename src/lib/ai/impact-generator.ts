import { z } from "zod";
import { db } from "../db";
import { IMPACT_GENERATOR_SYSTEM_PROMPT } from "./prompts-expanded";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const ImpactReportSchema = z.object({
    localSourcingImpact: z.string(),
    humanReadableStatement: z.string()
});

export type ImpactReportGeneration = z.infer<typeof ImpactReportSchema>;

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    material: "bamboo" | "recycled_paper" | "glass" | "cotton" | "other";
    origin: "local" | "international";
}

// Deterministic Math Rules for Impact estimation
const PLASTIC_SAVED_GRAMS_PER_UNIT: Record<string, number> = {
    bamboo: 15,
    recycled_paper: 5,
    glass: 50,
    cotton: 20,
    other: 0,
};

const CARBON_AVOIDED_KG_PER_LOCAL_UNIT = 0.5;

export async function generateImpactReportAction(orderId: string, items: OrderItem[], region: string) {
    const startTime = Date.now();
    let resultJSON: string | null = null;

    // 1. Deterministic Calculation Phase
    let totalPlasticSaved = 0;
    let totalCarbonAvoided = 0;

    items.forEach(item => {
        totalPlasticSaved += (PLASTIC_SAVED_GRAMS_PER_UNIT[item.material] || 0) * item.quantity;
        if (item.origin === "local") {
            totalCarbonAvoided += CARBON_AVOIDED_KG_PER_LOCAL_UNIT * item.quantity;
        }
    });

    try {
        const apiKey = process.env.OPENAI_API_KEY || "";
        if (!apiKey.startsWith("sk-") && !apiKey.startsWith("proj-")) {
            // MOCK FALLBACK
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockData = {
                localSourcingImpact: `By sourcing locally within ${region}, this order eliminated long-haul shipping emissions entirely.`,
                humanReadableStatement: `Incredible choice! Your order just saved ${totalPlasticSaved} grams of plastic and avoided ${totalCarbonAvoided.toFixed(1)} kg of carbon emissions. By choosing sustainable materials and local suppliers in ${region}, you are directly participating in the circular economy.`
            };

            const durationMs = Date.now() - startTime;
            const savedRecord = await db.saveImpactReport({
                orderId,
                items: items.map(i => ({ name: i.name, quantity: i.quantity })),
                estimatedPlasticSavedGrams: totalPlasticSaved,
                estimatedCarbonAvoidedKg: totalCarbonAvoided,
                ...mockData
            });

            return { success: true, data: savedRecord, durationMs };
        }

        // 2. AI Storytelling Phase
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: IMPACT_GENERATOR_SYSTEM_PROMPT.replace("{Region}", region) },
                {
                    role: "user",
                    content: `Data values calculated:\nPlastic Saved: ${totalPlasticSaved} grams\nCarbon Avoided: ${totalCarbonAvoided.toFixed(2)} kg\nRegion: ${region}\n\nGenerate the impact response.`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
        });

        resultJSON = response.choices[0].message.content;
        if (!resultJSON) {
            throw new Error("Empty response from AI");
        }

        const parsedData = JSON.parse(resultJSON);
        const validatedData = ImpactReportSchema.parse(parsedData);

        const durationMs = Date.now() - startTime;

        await db.saveLog({
            moduleId: "impact-reporting-generator",
            prompt: `Plastic: ${totalPlasticSaved}g | Carbon: ${totalCarbonAvoided}kg | Region: ${region}`,
            response: validatedData,
            durationMs
        });

        const savedRecord = await db.saveImpactReport({
            orderId,
            items: items.map(i => ({ name: i.name, quantity: i.quantity })),
            estimatedPlasticSavedGrams: totalPlasticSaved,
            estimatedCarbonAvoidedKg: totalCarbonAvoided,
            ...validatedData
        });

        return { success: true, data: savedRecord, durationMs };

    } catch (error: unknown) {
        const durationMs = Date.now() - startTime;
        console.error("AI Impact Generation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        await db.saveLog({
            moduleId: "impact-reporting-generator",
            prompt: `Plastic: ${totalPlasticSaved}g | Carbon: ${totalCarbonAvoided}kg`,
            response: { error: errorMessage, raw: resultJSON },
            durationMs
        });

        return {
            success: false,
            error: error instanceof z.ZodError ? "Failed to validate AI output format." : "Failed to generate report.",
            details: errorMessage
        };
    }
}
