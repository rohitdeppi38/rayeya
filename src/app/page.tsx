"use client";
import Head from "next/head";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import CategoryGeneratorForm from "@/components/modules/CategoryGeneratorForm";
import ProposalGeneratorForm from "@/components/modules/ProposalGeneratorForm";
import ImpactGeneratorForm from "@/components/modules/ImpactGeneratorForm";
import WhatsAppSimulator from "@/components/modules/WhatsAppSimulator";

export default function Home() {
  return (
    <>
    <Head>
      <title>Rayeva AI</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-50 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Rayeva AI</span>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            AI Systems Assignment (All Modules)
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-linear-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 text-transparent bg-clip-text">
              Applied AI for <br className="hidden md:block" /> Sustainable Commerce
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Automated catalog enrichment, B2B proposal generation, impact reporting, and customer support via structured AI outputs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Modules */}
      <section className="px-6 relative z-10 max-w-7xl mx-auto space-y-12">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              <span>Module 1</span>
            </div>
            <h2 className="text-2xl font-bold">Catalog Enrichment</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Automatically assign categories and extract SEO tags from raw product descriptions.</p>
          </div>
          <CategoryGeneratorForm />
        </motion.div>

        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-16 max-w-4xl mx-auto" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Module 2</span>
            </div>
            <h2 className="text-2xl font-bold">Proposal Generator</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Synthesize B2B product mix proposals tailored to client budget constraints.</p>
          </div>
          <ProposalGeneratorForm />
        </motion.div>

        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-16 max-w-4xl mx-auto" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* MODULE 3 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                <span>Module 3</span>
              </div>
              <h2 className="text-2xl font-bold">Impact Reporting</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">Translate strict mathematical supply chain data into an engaging AI story.</p>
            </div>
            <ImpactGeneratorForm />
          </motion.div>

          {/* MODULE 4 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
                <span>Module 4</span>
              </div>
              <h2 className="text-2xl font-bold">WhatsApp RAG Support</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">A dual-LLM architecture routing intent and pulling from a simulated order database.</p>
            </div>
            <WhatsAppSimulator />
          </motion.div>
        </div>

      </section>
    </main>
    </>
  );
}
