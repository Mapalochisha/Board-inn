"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, RefreshCcw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center text-white shadow-xl shadow-green-600/20">
            <Home size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            We encountered an unexpected error. Don&apos;t worry, your data is safe.
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 text-left border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-500">
            <AlertTriangle size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Error Log</span>
          </div>
          <code className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all leading-relaxed">
            {error.message || "Unknown error"}
          </code>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => reset()} 
            className="flex-1 bg-green-600 hover:bg-green-700 h-12 rounded-xl text-base font-bold shadow-lg shadow-green-600/20 gap-2"
          >
            <RefreshCcw size={18} />
            Try Again
          </Button>
          <Button 
            asChild 
            variant="outline" 
            className="flex-1 h-12 rounded-xl text-base font-bold border-2"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
