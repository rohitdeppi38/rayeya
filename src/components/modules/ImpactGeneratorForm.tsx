"use client";

import { useState } from "react";
import { Loader2, Trees, BarChart, FileText, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImpactReport {
    orderId: string;
    items: Array<{ name: string; quantity: number }>;
    estimatedPlasticSavedGrams: number;
    estimatedCarbonAvoidedKg: number;
    localSourcingImpact: string;
    humanReadableStatement: string;
}

export default function ImpactGeneratorForm() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImpactReport | null>(null);
    const [error, setError] = useState("");

    const handleSimulateOrder = async () => {
        setLoading(true);
        setError("");
        setResult(null);

        // Hardcoded mock order for UI demo purposes
        const mockPayload = {
            orderId: "ORD-993-ENV",
            region: "Seattle, WA",
            items: [
                { id: "1", name: "Bamboo Toothbrushes (Bulk Pack)", quantity: 200, material: "bamboo", origin: "international" },
                { id: "2", name: "Recycled Paper Towels", quantity: 500, material: "recycled_paper", origin: "local" },
                { id: "3", name: "Glass Dispenser Bottles", quantity: 50, material: "glass", origin: "local" }
            ]
        };

        try {
            const response = await fetch("/api/generate-impact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(mockPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate report.");
            }

            setResult(data.data as ImpactReport);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                        <Trees className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">AI Impact Reporting</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Deterministic math + LLM storytelling</p>
                    </div>
                </div>
                <button
                    onClick={handleSimulateOrder}
                    disabled={loading}
                    className="py-2.5 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-xl flex items-center space-x-2 transition-all disabled:opacity-50 hover:bg-zinc-800 dark:hover:bg-zinc-100"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Simulate Completed Order</span>
                </button>
            </div>

            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
                    >
                        {/* Deterministic Stats side */}
                        <div className="col-span-1 space-y-4">
                            <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-500 mb-2">
                                    <BarChart className="w-4 h-4" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider">Plastic Saved</h4>
                                </div>
                                <div className="text-3xl font-extrabold text-amber-900 dark:text-amber-400">
                                    {result.estimatedPlasticSavedGrams.toLocaleString()} <span className="text-lg font-medium opacity-60">grams</span>
                                </div>
                            </div>

                            <div className="bg-linear-to-br from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10 p-5 rounded-2xl border border-sky-100 dark:border-sky-900/30">
                                <div className="flex items-center space-x-2 text-sky-800 dark:text-sky-500 mb-2">
                                    <Globe className="w-4 h-4" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider">Carbon Avoided</h4>
                                </div>
                                <div className="text-3xl font-extrabold text-sky-900 dark:text-sky-400">
                                    {result.estimatedCarbonAvoidedKg.toLocaleString()} <span className="text-lg font-medium opacity-60">kg</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Generated Text side */}
                        <div className="col-span-2 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 block">
                            <div className="mb-5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Human-Readable Impact Statement</h4>
                                <p className="text-zinc-800 dark:text-zinc-200 text-lg leading-relaxed font-serif">
                                    &quot;{result.humanReadableStatement}&quot;
                                </p>
                            </div>

                            <div className="pt-5 border-t border-zinc-200 dark:border-zinc-700 border-dashed">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Local Sourcing Note</h4>
                                <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                                    {result.localSourcingImpact}
                                </p>
                            </div>

                        </div>

                        <div className="col-span-full">
                            {/* JSON Output View */}
                            <div className="mt-2 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700">
                                <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between border-b border-zinc-700">
                                    <span className="text-xs font-mono text-zinc-400">response.json</span>
                                </div>
                                <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-300">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
