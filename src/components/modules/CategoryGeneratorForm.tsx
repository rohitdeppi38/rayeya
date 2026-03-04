"use client";

import { useState } from "react";
import { Loader2, Tag, Leaf, FolderOpen, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryResult {
    primaryCategory: string;
    subCategory: string;
    seoTags: string[];
    sustainabilityFilters: string[];
}

export default function CategoryGeneratorForm() {
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CategoryResult | null>(null);
    const [error, setError] = useState("");

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || description.length < 10) {
            setError("Please provide a description of at least 10 characters.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch("/api/generate-category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: "test-product-" + Math.floor(Math.random() * 1000), // Random testing product ID
                    productDescription: description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate categories.");
            }

            setResult(data.data as CategoryResult);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Box className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Auto-Category & Tag Generator</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">AI-powered catalog enrichment for sustainable product listings</p>
                </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Product Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                        placeholder="e.g. A set of 4 bamboo toothbrushes with charcoal infused bristles, zero plastic packaging..."
                        className="w-full p-4 h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none text-zinc-900 dark:text-white"
                    />
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading || description.length < 10}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Analyzing Product...</span>
                        </>
                    ) : (
                        <span>Generate Structured Tags</span>
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
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center">
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md text-sm mr-2 font-mono">200 OK</span>
                            Generated AI Structure
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50">
                                <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 mb-2">
                                    <FolderOpen className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Classification</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 dark:text-zinc-400">Primary:</span>
                                        <span className="font-semibold text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 px-2 py-1 rounded shadow-sm border border-zinc-100 dark:border-zinc-700/50">{result.primaryCategory}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 dark:text-zinc-400">Sub:</span>
                                        <span className="font-semibold text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 px-2 py-1 rounded shadow-sm border border-zinc-100 dark:border-zinc-700/50">{result.subCategory}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50">
                                <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 mb-2">
                                    <Tag className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wider">SEO Tags</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    {result.seoTags.map(tag => (
                                        <span key={tag} className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/30 px-2 py-1 rounded-md">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50">
                                <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 mb-2">
                                    <Leaf className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Sustainability Filters</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm mt-3">
                                    {result.sustainabilityFilters.length > 0 ? (
                                        result.sustainabilityFilters.map(filter => (
                                            <span key={filter} className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 px-3 py-1.5 rounded-full font-medium flex items-center shadow-sm">
                                                <Leaf className="w-3 h-3 mr-1.5" />
                                                {filter}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-400">No specific sustainability filters detected.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* JSON Output View */}
                        <div className="mt-4 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700">
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
