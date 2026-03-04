export interface LogEntry {
    id: string;
    moduleId: string;
    prompt: string;
    response: unknown;
    timestamp: string;
    durationMs: number;
}

export interface GeneratedCategory {
    id: string;
    productId: string;
    originalText: string;
    primaryCategory: string;
    subCategory: string;
    seoTags: string[];
    sustainabilityFilters: string[];
    timestamp: string;
}

export interface GeneratedProposal {
    id: string;
    clientId: string;
    clientRequest: string;
    maxBudget: number;
    productMix: Array<{
        name: string;
        quantity: number;
        unitCost: number;
        totalLineCost: number;
        sustainabilityNote: string;
    }>;
    totalEstimatedCost: number;
    impactPositioningSummary: string;
    timestamp: string;
}

export interface ImpactReport {
    id: string;
    orderId: string;
    items: Array<{ name: string; quantity: number }>;
    estimatedPlasticSavedGrams: number;
    estimatedCarbonAvoidedKg: number;
    localSourcingImpact: string;
    humanReadableStatement: string;
    timestamp: string;
}

export interface ChatMessage {
    id: string;
    sessionId: string;
    userMessage: string;
    aiResponse: string;
    intentDetected: string;
    escalated: boolean;
    timestamp: string;
}

// In-memory mock DB to simulate persistent storage
class MockDatabase {
    public logs: LogEntry[] = [];
    public categories: GeneratedCategory[] = [];
    public proposals: GeneratedProposal[] = [];
    public impactReports: ImpactReport[] = [];
    public chatLogs: ChatMessage[] = [];

    // Mock Order Database for RAG (Module 4)
    public orders: Record<string, { status: string, expectedDelivery: string, items: string[] }> = {
        "ORD-123": { status: "Shipped", expectedDelivery: "Oct 25, 2026", items: ["Bamboo Toothbrush x50"] },
        "ORD-456": { status: "Processing", expectedDelivery: "Oct 28, 2026", items: ["Recycled Paper Towels x200"] }
    };

    async saveLog(log: Omit<LogEntry, "id" | "timestamp">) {
        const entry: LogEntry = {
            ...log,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        this.logs.push(entry);
        return entry;
    }

    async saveCategory(cat: Omit<GeneratedCategory, "id" | "timestamp">) {
        const entry: GeneratedCategory = {
            ...cat,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        this.categories.push(entry);
        return entry;
    }

    async saveProposal(prop: Omit<GeneratedProposal, "id" | "timestamp">) {
        const entry: GeneratedProposal = {
            ...prop,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        this.proposals.push(entry);
        return entry;
    }

    async saveImpactReport(report: Omit<ImpactReport, "id" | "timestamp">) {
        const entry: ImpactReport = {
            ...report,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        this.impactReports.push(entry);
        return entry;
    }

    async saveChatLog(chat: Omit<ChatMessage, "id" | "timestamp">) {
        const entry: ChatMessage = {
            ...chat,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        this.chatLogs.push(entry);
        return entry;
    }
}

// Export a singleton instance
export const db = new MockDatabase();
