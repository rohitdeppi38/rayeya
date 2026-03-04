"use client";

import { useState } from "react";
import { Loader2, DollarSign, Calculator, LeafyGreen, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProposalResult {
    productMix: Array<{
        name: string;
        quantity: number;
        unitCost: number;
        totalLineCost: number;
        sustainabilityNote: string;
    }>;
    totalEstimatedCost: number;
    impactPositioningSummary: string;
}

export default function ProposalGeneratorForm() {
    const [requestDetails, setRequestDetails] = useState("");
    const [budget, setBudget] = useState<string>("5000"); // default budget
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ProposalResult | null>(null);
    const [error, setError] = useState("");

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedBudget = parseFloat(budget);

        if (!requestDetails || requestDetails.length < 10) {
            setError("Please provide client request details (min 10 characters).");
            return;
        }
        if (isNaN(parsedBudget) || parsedBudget <= 0) {
            setError("Please enter a valid positive budget.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch("/api/generate-proposal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: "client-demo-" + Math.floor(Math.random() * 1000),
                    clientRequest: requestDetails,
                    maxBudget: parsedBudget,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate proposal.");
            }

            setResult(data.data as ProposalResult);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Briefcase className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">AI B2B Proposal Generator</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Automate sustainable product mixes & cost estimation</p>
                </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Client Request Details
                        </label>
                        <textarea
                            value={requestDetails}
                            onChange={(e) => setRequestDetails(e.target.value)}
                            disabled={loading}
                            placeholder="e.g. We are a boutique hotel in Seattle looking to replace all our room amenities with sustainable, locally-sourced alternatives."
                            className="w-full p-4 h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none text-zinc-900 dark:text-white"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Max Budget ($)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-5 w-5 text-zinc-400" />
                            </div>
                            <input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-zinc-900 dark:text-white"
                            />
                        </div>
                        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || requestDetails.length < 10}
                    className="w-full py-3 px-4 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Synthesizing Proposal...</span>
                        </>
                    ) : (
                        <span>Generate B2B Proposal</span>
                    )}
                </button>
            </form>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-serif">Order Proposal</h3>
                            <div className="text-right">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Estimated Cost</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    ${result.totalEstimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Product Mix Table */}
                        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700/50 mb-6">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">Product Name & Sustainability Setup</th>
                                        <th className="px-4 py-3 text-right">Qty</th>
                                        <th className="px-4 py-3 text-right">Unit Price</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700/50">
                                    {result.productMix.map((product, idx) => (
                                        <tr key={idx} className="bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-zinc-900 dark:text-white">{product.name}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-start">
                                                    <LeafyGreen className="w-3 h-3 mr-1 mt-0.5 shrink-0" />
                                                    {product.sustainabilityNote}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">{product.quantity.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">${product.unitCost.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-white">${product.totalLineCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Impact Statement */}
                        <div className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 border border-emerald-100 dark:border-emerald-800/30 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-5 dark:opacity-10 pointer-events-none">
                                <LeafyGreen className="w-32 h-32" />
                            </div>
                            <h4 className="flex items-center text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2">
                                <Calculator className="w-4 h-4 mr-2" />
                                Impact Positioning Summary
                            </h4>
                            <p className="text-emerald-900 dark:text-emerald-100/90 text-sm leading-relaxed relative z-10">
                                {result.impactPositioningSummary}
                            </p>
                        </div>

                        {/* JSON Output View */}
                        <div className="mt-6 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700">
                            <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between border-b border-zinc-700">
                                <span className="text-xs font-mono text-zinc-400">response.json</span>
                            </div>
                            <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-300">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
