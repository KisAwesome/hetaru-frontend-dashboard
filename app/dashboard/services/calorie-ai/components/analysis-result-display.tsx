'use client';

import React, { useState, useRef } from 'react';
import { AnalysisResult } from '../types';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisResultDisplayProps {
  result: AnalysisResult;
}

// Helper for the nutrient grid (Dark Mode Friendly)
const NutrientItem = ({ label, value, unit = "g", colorClass }: { label: string, value?: number, unit?: string, colorClass: string }) => (
    <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center border bg-opacity-10 ${colorClass}`}>
        <span className="text-xl font-bold text-foreground">{value ?? 0}<span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span></span>
        <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">{label}</span>
    </div>
);

const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result }) => {
    const {
        foodName,
        description,
        totalCalories,
        nutrition,
        servingSize,
        items,
        thoughtProcess,
        confidenceScore
    } = result;
    console.log("Analysis Result:", result);

    const [showReasoning, setShowReasoning] = useState(false);
    const reasoningRef = useRef<HTMLDivElement>(null);

    // Normalize Confidence Score
    let rawScore = confidenceScore || 0;
    if (rawScore <= 1 && rawScore > 0) rawScore *= 100;
    const score = rawScore;

    // Dynamic Colors based on Score
    const confidenceColor = score >= 80 ? "text-green-500 border-green-500/30 bg-green-500/10" 
        : score >= 50 ? "text-amber-500 border-amber-500/30 bg-amber-500/10" 
        : "text-red-500 border-red-500/30 bg-red-500/10";
        
    const confidenceIcon = score >= 80 ? <CheckCircle2 className="w-3.5 h-3.5" /> : score >= 50 ? <HelpCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />;

    const handleConfidenceClick = () => {
        setShowReasoning(true);
        setTimeout(() => {
            if (reasoningRef.current) {
                reasoningRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. MAIN HEADER CARD */}
            <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex justify-between items-start mb-4 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight tracking-tight">{foodName}</h2>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Serving Size: {servingSize}</p>
                    </div>
                    
                    <button
                        onClick={handleConfidenceClick}
                        className={`flex flex-shrink-0 items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-transform hover:scale-105 ${confidenceColor}`}
                    >
                        {confidenceIcon}
                        <span>{score}% Confidence</span>
                    </button>
                </div>

                {/* Energy Card - Darker Gradient for Contrast */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 text-foreground rounded-xl p-6 mb-6 flex items-center justify-between">
                    <div className="relative z-10">
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Total Energy</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-extrabold tracking-tighter text-primary">{Math.round(totalCalories || 0)}</span>
                            <span className="text-lg font-medium text-muted-foreground">kcal</span>
                        </div>
                    </div>
                    {/* Background Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-9xl opacity-5 pointer-events-none select-none">
                        ⚡️
                    </div>
                </div>

                <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
            </div>

            {/* 2. MACROS & MICROS GRID */}
            <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-sm border border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Nutrition Facts
                </h3>

                <div className="grid grid-cols-3 gap-3">
                    {/* Using semantic colors with opacity for Dark Mode compatibility */}
                    <NutrientItem label="Protein" value={nutrition?.protein} colorClass="bg-blue-500/10 border-blue-500/20 text-blue-500" />
                    <NutrientItem label="Carbs" value={nutrition?.carbohydrates} colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500" />
                    <NutrientItem label="Fat" value={nutrition?.fat} colorClass="bg-rose-500/10 border-rose-500/20 text-rose-500" />
                    
                    <NutrientItem label="Fiber" value={nutrition?.fiber} colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-500" />
                    <NutrientItem label="Sugar" value={nutrition?.sugar} colorClass="bg-purple-500/10 border-purple-500/20 text-purple-500" />
                    <NutrientItem label="Sodium" value={nutrition?.sodium} unit="mg" colorClass="bg-slate-500/10 border-slate-500/20 text-slate-500" />
                </div>
            </div>

            {/* 3. INGREDIENT BREAKDOWN */}
            {items && items.length > 0 && (
                <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-sm border border-border">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Composition Breakdown
                    </h3>
                    <div className="space-y-2">
                        {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors">
                                <span className="font-medium text-sm text-foreground">{item.name}</span>
                                <span className="font-mono text-xs text-muted-foreground font-semibold">{item.calories} kcal</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. AI THOUGHT PROCESS */}
            {thoughtProcess && (
                <div ref={reasoningRef} className="border border-border rounded-2xl overflow-hidden bg-card/50">
                    <Button
                        variant="ghost"
                        onClick={() => setShowReasoning(!showReasoning)}
                        className="w-full flex justify-between items-center p-4 h-auto hover:bg-secondary/50 font-medium text-muted-foreground"
                    >
                        <span className="flex items-center gap-2 text-sm">
                            <SparklesIcon className="w-4 h-4 text-primary" />
                            AI Analysis Reasoning
                        </span>
                        {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    {showReasoning && (
                        <div className="p-4 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border bg-card/30 animate-in slide-in-from-top-2">
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                {thoughtProcess}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="text-center pt-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
                    AI Estimated • Verify with Professional
                </p>
            </div>
        </div>
    );
};

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    )
}

export default AnalysisResultDisplay;