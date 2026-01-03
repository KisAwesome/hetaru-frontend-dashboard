'use client';

import React, { useState, useCallback } from 'react';
import { AnalysisResult, ChatMessage } from './types';
import { useAuth } from '@/components/firebase-auth-provider';
import ImageUploader from './components/image-uploader';
import AnalysisResultDisplay from './components/analysis-result-display';
import ChatInterface from './components/chat-interface';
import { SparklesIcon } from './components/icons';
import { ServicePageLayout } from '@/components/dashboard/service-layout';
import { api } from '@/lib/api'; 
// 👇 1. Import Toast hooks
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CalorieAIPage() {
  const { user } = useAuth();
  const { toast } = useToast(); // Hook for notifications
  const router = useRouter();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setError(null);
    setChatHistory([]);
    setChatError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile || !user) {
      toast({
        title: "Login Required",
        description: "Please login to use AI services.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setChatHistory([]);

    try {
            const form = new FormData();
    form.append("image", imageFile);             // <-- raw file
    form.append("mimeType", imageFile.type);     // optional (backend can infer)

    const result = await api.post(
      "/api/services/calorie-ai/analyze",
      form,
      {
        formData: true,
      }
    );

      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
      setAnalysis(result.data); 

    } catch (err: any) {
      
      const errorMessage = err.message || "An unknown error occurred";
      console.log(errorMessage)

      // 👇 2. Specific Handler for Payment/Credit Errors
      if (errorMessage.includes("funds") || errorMessage.includes("INSUFFICIENT_FUNDS")) {
        toast({
          title: "Out of Credits 💳",
          description: "You don't have enough credits to run this analysis.",
          variant: "destructive",
          action: (
            <ToastAction altText="Top Up" onClick={() => router.push('/dashboard/billing')}>
              Get Credits
            </ToastAction>
          ),
        });
        setError("Insufficient credits. Please top up to continue.");
      } 
      // 👇 3. Specific Handler for Image Size Errors
      else if (errorMessage.includes("413") || errorMessage.includes("Payload Too Large")) {
        toast({
            title: "Image Too Large",
            description: "Please upload an image smaller than 10MB.",
            variant: "destructive"
        });
        setError("The image file is too large.");
      }
      // 👇 4. Generic Fallback
      else {
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive"
        });
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, user, toast, router]);

  const handleSendMessage = useCallback(async (message: string) => {
    setChatError(null);
    setIsChatLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', text: message }]);

    try {
       await new Promise(r => setTimeout(r, 1000));
       setChatHistory(prev => [...prev, { role: 'model', text: "I can help you with that! (Backend chat endpoint pending implementation)" }]);
    } catch (err) {
      setChatError("Failed to send message");
    } finally {
      setIsChatLoading(false);
    }
  }, [analysis]);

  return (
    <ServicePageLayout 
      title="Calorie & Macro Tracker" 
      icon="🍎"
    >
      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start pb-10 h-full">
        
        {/* LEFT: Uploader */}
        <div className="flex flex-col items-center gap-6">
          <ImageUploader onImageSelect={handleImageSelect} previewUrl={previewUrl} />
          
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !imageFile}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Analyze Meal (-40 Credits)
              </>
            )}
          </button>
        </div>
        
        {/* RIGHT: Results */}
        <div className="w-full flex flex-col items-start justify-start min-h-[500px]">
          {isLoading && (
            <div className="text-center text-slate-500 w-full pt-20">
              <p className="text-lg font-medium">AI is thinking...</p>
              <p>Analyzing nutritional content.</p>
            </div>
          )}
          
          {/* Enhanced Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-8 rounded-xl relative w-full text-center flex flex-col items-center justify-center gap-2">
              <div className="p-2 bg-red-100 rounded-full">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
              </div>
              <strong className="font-semibold text-lg">Analysis Failed</strong>
              <span className="block sm:inline">{error}</span>
              
              {/* Show a direct Top Up button inside the error box if it's a funds issue */}
              {(error.includes("insufficient") || error.includes("402")) && (
                  <Button 
                    variant="outline" 
                    className="mt-2 border-red-200 hover:bg-red-100 text-red-700"
                    onClick={() => router.push('/dashboard/billing')}
                  >
                    Top Up Wallet
                  </Button>
              )}
            </div>
          )}
          
          {analysis && (
            <div className="w-full flex flex-col gap-8 animate-in slide-in-from-right-4">
              <AnalysisResultDisplay result={analysis} />
              <ChatInterface 
                chatHistory={chatHistory} 
                onSendMessage={handleSendMessage} 
                isLoading={isChatLoading} 
                error={chatError}
              />
            </div>
          )}
          
          {!isLoading && !error && !analysis && (
             <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 w-full h-full flex flex-col justify-center items-center">
               <p className="font-medium text-lg">Your nutritional analysis will appear here.</p>
               <p className="text-sm mt-1">Upload an image and click "Analyze Meal" to begin.</p>
             </div>
          )}
        </div>
      </div>
    </ServicePageLayout>
  );
}