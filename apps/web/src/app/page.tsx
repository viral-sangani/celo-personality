"use client";
import { useMiniApp } from "@/contexts/miniapp-context";
import { PersonalityQuiz } from "@/components/personality-quiz";

export default function Home() {
  const { isMiniAppReady } = useMiniApp();
  
  if (!isMiniAppReady) {
    return (
      <main className="flex-1">
        <section className="flex items-center justify-center min-h-screen bg-celo-tan px-4">
          <div className="w-full max-w-md mx-auto text-center">
            <div className="border-3 sm:border-4 border-black bg-celo-yellow p-6 sm:p-8 mb-3 sm:mb-4">
              <div className="font-inter font-bold text-xl sm:text-2xl tracking-tight uppercase">
                LOADING
              </div>
            </div>
            <div className="w-full bg-white border-3 sm:border-4 border-black h-3 sm:h-4">
              <div className="h-full bg-black animate-pulse w-1/2"></div>
            </div>
          </div>
        </section>
      </main>
    );
  }
  
  return <PersonalityQuiz />;
}
