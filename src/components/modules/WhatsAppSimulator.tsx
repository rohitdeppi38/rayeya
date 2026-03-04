"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
    id: string;
    sender: "user" | "bot";
    text: string;
    intent?: string;
    escalated?: boolean;
}

export default function WhatsAppSimulator() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: "0", sender: "bot", text: "Hi! 👋 I'm the Rayeva Support Assistant. Ask me about your order status (try 'Where is ORD-123?'), our return policy, or request a human." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sessionId = useRef("session-" + Math.floor(Math.random() * 10000)).current;

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: "user",
            text: input.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chat-bot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    userMessage: userMsg.text,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send message.");
            }

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: data.data.aiResponse,
                intent: data.data.intentDetected,
                escalated: data.data.escalated
            };

            setMessages(prev => [...prev, botMsg]);
        } catch {
            setMessages(prev => [...prev, { id: "err", sender: "bot", text: "❌ Connection error." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border-8 border-white dark:border-zinc-800 overflow-hidden relative h-[650px] flex flex-col">
            {/* Phone Header */}
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600">
                        <MessageSquare className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm tracking-wide">Rayeva Support</h2>
                        <p className="text-[10px] text-emerald-100 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-300 rounded-full mr-1.5 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area (WhatsApp background pattern imitation) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] dark:bg-zinc-950/50 relative">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`max-w-[85%] px-4 py-2 text-sm shadow-sm relative ${msg.sender === "user"
                                    ? "bg-[#dcf8c6] dark:bg-emerald-800 text-zinc-900 dark:text-emerald-50 rounded-2xl rounded-tr-sm"
                                    : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-sm"
                                    }`}
                            >
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                            </div>

                            {/* Intent Debug UI (Only show for bot messages with intents) */}
                            {msg.intent && (
                                <div className={`mt-1 flex items-center space-x-1 text-[10px] uppercase font-bold px-1 ${msg.escalated ? "text-red-500" : "text-zinc-400"}`}>
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Intent: {msg.intent}</span>
                                    {msg.escalated && <span className="flex items-center ml-2 border border-red-500/30 bg-red-500/10 px-1 rounded"><AlertCircle className="w-3 h-3 mr-1" /> Escalated</span>}
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                            <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm flex space-x-1.5 items-center shadow-sm">
                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f0f0] dark:bg-zinc-900 px-4 py-3 pb-6 flex items-center space-x-2 z-10 border-t border-zinc-200 dark:border-zinc-800">
                <form onSubmit={handleSend} className="flex-1 relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        placeholder="Type a message..."
                        className="w-full bg-white dark:bg-zinc-800 py-3 pl-4 pr-12 rounded-full border-none shadow-sm focus:ring-2 focus:ring-emerald-500 text-sm outline-none text-zinc-900 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-1 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-zinc-400 hover:bg-emerald-700 transition-colors"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
