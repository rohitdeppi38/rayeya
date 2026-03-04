import { z } from "zod";
import { db } from "../db";
import { WHATSAPP_INTENT_SYSTEM_PROMPT, WHATSAPP_RESPONSE_SYSTEM_PROMPT } from "./prompts-expanded";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const IntentSchema = z.object({
    intent: z.enum(["ORDER_STATUS", "RETURN_POLICY", "ESCALATION", "GENERAL"]),
    extractedOrderId: z.string().nullable()
});

export async function processWhatsAppMessage(sessionId: string, userMessage: string) {
    const startTime = Date.now();
    let intentResultJSON: string | null = null;
    let finalAiResponse = "";
    let finalIntent = "GENERAL";
    let isEscalated = false;

    try {
        const apiKey = process.env.OPENAI_API_KEY || "";
        if (!apiKey.startsWith("sk-") && !apiKey.startsWith("proj-")) {
            // MOCK FALLBACK for Free Version Demo
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Very basic mock routing based on keywords
            const lowerMsg = userMessage.toLowerCase();

            let mockIntent = "GENERAL";
            let mockResponse = "Thanks for reaching out! How can I help you today?";

            if (lowerMsg.includes("order") || lowerMsg.includes("where")) {
                mockIntent = "ORDER_STATUS";
                mockResponse = "I see you're asking about an order! If you have your ORD-XXX number, let me know. Example: 'Where is ORD-123?'";
                if (lowerMsg.includes("ord-123")) {
                    mockResponse = "📦 *Order ORD-123*\nStatus: Shipped 🚚\nExpected Delivery: Oct 25, 2026\nItems: Bamboo Toothbrush x50";
                } else if (lowerMsg.includes("ord-456")) {
                    mockResponse = "📦 *Order ORD-456*\nStatus: Processing ⚙️\nExpected Delivery: Oct 28, 2026\nItems: Recycled Paper Towels x200";
                }
            } else if (lowerMsg.includes("return") || lowerMsg.includes("refund")) {
                mockIntent = "RETURN_POLICY";
                mockResponse = "Our sustainable return policy allows returns within 30 days for unused items in original eco-friendly packaging. ♻️";
            } else if (lowerMsg.includes("manager") || lowerMsg.includes("angry") || lowerMsg.includes("human") || lowerMsg.includes("escalate")) {
                mockIntent = "ESCALATION";
                mockResponse = "I understand you need further assistance. I am escalating this to a human support agent who will be with you shortly. 👩‍💻";
                isEscalated = true;
            }

            const durationMs = Date.now() - startTime;

            const savedChat = await db.saveChatLog({
                sessionId,
                userMessage,
                aiResponse: mockResponse,
                intentDetected: mockIntent,
                escalated: isEscalated
            });

            return { success: true, data: savedChat, durationMs };
        }

        // 1. Intent Detection Phase
        const intentResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: WHATSAPP_INTENT_SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        intentResultJSON = intentResponse.choices[0].message.content;
        const intentData = IntentSchema.parse(JSON.parse(intentResultJSON || "{}"));
        finalIntent = intentData.intent;

        // 2. RAG Context Retrieval Phase
        let contextStr = "No additional context found.";

        if (finalIntent === "ORDER_STATUS" && intentData.extractedOrderId) {
            const orderData = db.orders[intentData.extractedOrderId];
            if (orderData) {
                contextStr = `Database Record for ${intentData.extractedOrderId}: Status is ${orderData.status}. Delivery by ${orderData.expectedDelivery}. Items: ${orderData.items.join(", ")}`;
            } else {
                contextStr = `Database Record for ${intentData.extractedOrderId}: NOT FOUND. Tell the user the order number is invalid.`;
            }
        } else if (finalIntent === "RETURN_POLICY") {
            contextStr = "Policy Document: Returns allowed within 30 days for unused items in original sustainable packaging. Refund is processed to original payment method within 5-7 days.";
        }

        // 3. Response Generation Phase
        if (finalIntent === "ESCALATION") {
            isEscalated = true;
            finalAiResponse = "I apologize for the inconvenience. I have escalated your ticket and a human support representative will message you here shortly.";
        } else {
            const chatResponse = await openai.chat.completions.create({
                model: "gpt-4o", // Use a better model for natural chatting
                messages: [
                    { role: "system", content: WHATSAPP_RESPONSE_SYSTEM_PROMPT },
                    { role: "system", content: `CONTEXT RETRIEVED:\n${contextStr}` },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
            });
            finalAiResponse = chatResponse.choices[0].message.content || "I am currently unable to process this request.";
        }

        const durationMs = Date.now() - startTime;

        // Save final log
        const savedChat = await db.saveChatLog({
            sessionId,
            userMessage,
            aiResponse: finalAiResponse,
            intentDetected: finalIntent,
            escalated: isEscalated
        });

        return { success: true, data: savedChat, durationMs };

    } catch (error: unknown) {
        console.error("AI WhatsApp Bot Error:", error);

        return {
            success: false,
            error: "Failed to process message.",
            details: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
