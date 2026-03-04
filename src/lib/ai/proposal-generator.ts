import { z } from "zod";
import { db } from "../db";
import { PROPOSAL_GENERATOR_SYSTEM_PROMPT } from "./prompts";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const ProposalResultSchema = z.object({
    productMix: z.array(
        z.object({
            name: z.string(),
            quantity: z.number(),
            unitCost: z.number(),
            totalLineCost: z.number(),
            sustainabilityNote: z.string(),
        })
    ),
    totalEstimatedCost: z.number(),
    impactPositioningSummary: z.string(),
});

export type ProposalResult = z.infer<typeof ProposalResultSchema>;

export async function generateProposalAction(clientId: string, clientRequest: string, maxBudget: number) {
    const startTime = Date.now();
    let resultJSON: string | null = null;

    try {
        const apiKey = process.env.OPENAI_API_KEY || "";
        if (!apiKey.startsWith("sk-") && !apiKey.startsWith("proj-")) {
            // MOCK FALLBACK
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate a fake proposal that fits within the budget
            const targetBudget = maxBudget * 0.95; // aim for 95% usage
            const itemPrice = Math.floor(targetBudget / 100);

            const mockData = {
                productMix: [
                    {
                        name: "Premium Bamboo Toothbrushes (Bulk)",
                        quantity: 100,
                        unitCost: itemPrice,
                        totalLineCost: 100 * itemPrice,
                        sustainabilityNote: "Zero plastic packaging, compostable handle."
                    }
                ],
                totalEstimatedCost: 100 * itemPrice,
                impactPositioningSummary: "By switching to these premium bamboo toothbrushes, your hotel will eliminate approximately 2.5kg of plastic waste per month, directly contributing to local oceanic conservation goals."
            };

            const durationMs = Date.now() - startTime;
            const savedRecord = await db.saveProposal({
                clientId,
                clientRequest,
                maxBudget,
                ...mockData
            });

            return { success: true, data: savedRecord, durationMs };
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Suggesting GPT-4o for complex reasoning & math, but can fallback to gpt-3.5-turbo
            messages: [
                { role: "system", content: PROPOSAL_GENERATOR_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Client Request:\n"${clientRequest}"\n\nMaximum Budget Constraint: $${maxBudget}\n\nGenerate the structured B2B proposal.`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
        });

        resultJSON = response.choices[0].message.content;
        if (!resultJSON) {
            throw new Error("Empty response from AI");
        }

        // Parse and validate
        const parsedData = JSON.parse(resultJSON);
        const validatedData = ProposalResultSchema.parse(parsedData);

        const durationMs = Date.now() - startTime;

        // Save prompt & response log
        await db.saveLog({
            moduleId: "b2b-proposal-generator",
            prompt: `Budget: ${maxBudget} | Req: ${clientRequest}`,
            response: validatedData,
            durationMs
        });

        // Save generated proposal to DB
        const savedRecord = await db.saveProposal({
            clientId,
            clientRequest,
            maxBudget,
            ...validatedData
        });

        return { success: true, data: savedRecord, durationMs };

    } catch (error: unknown) {
        const durationMs = Date.now() - startTime;
        console.error("AI Proposal Generation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Log failures
        await db.saveLog({
            moduleId: "b2b-proposal-generator",
            prompt: `Budget: ${maxBudget} | Req: ${clientRequest}`,
            response: { error: errorMessage, raw: resultJSON },
            durationMs
        });

        return {
            success: false,
            error: error instanceof z.ZodError ? "Failed to validate AI output format (Math or Structure error)." : "Failed to generate proposal.",
            details: errorMessage
        };
    }
}
