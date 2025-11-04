"use client";

import { useState } from "react";

type PersonalityType = "mini app" | "human" | "regen" | "L2" | "stablecoin";

interface Question {
  id: number;
  question: string;
  answers: {
    text: string;
    personality: PersonalityType;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "If Celo were a city, you'd hang out at the…",
    answers: [
      { text: "arcade", personality: "mini app" },
      { text: "passport control", personality: "human" },
      { text: "community garden", personality: "regen" },
      { text: "gas station", personality: "L2" },
      { text: "tap-to-pay cafe", personality: "stablecoin" },
    ],
  },
  {
    id: 2,
    question: "What's most likely in your wallet?",
    answers: [
      { text: "Testnet tokens", personality: "L2" },
      { text: "A hypercert", personality: "regen" },
      { text: "cCOP, cNGN, cEUR", personality: "stablecoin" },
      { text: "A human verification", personality: "human" },
      { text: "Onchain points", personality: "mini app" },
    ],
  },
  {
    id: 3,
    question: "Pick a character",
    answers: [
      { text: "The tinkerer", personality: "mini app" },
      { text: "The architect", personality: "L2" },
      { text: "The real one", personality: "human" },
      { text: "The philosopher", personality: "regen" },
      { text: "The value add", personality: "stablecoin" },
    ],
  },
  {
    id: 4,
    question: "What's your favorite part of Celo?",
    answers: [
      { text: "Offsetting carbon every time you transact", personality: "regen" },
      { text: "Staying verified and private", personality: "human" },
      { text: "Paying gas with stables", personality: "stablecoin" },
      { text: "Playing with apps on the go", personality: "mini app" },
      { text: "Fast block times", personality: "L2" },
    ],
  },
  {
    id: 5,
    question: "Pick a mission statement",
    answers: [
      { text: "Frontier chain for global impact", personality: "regen" },
      { text: "Scaling mobile use cases", personality: "mini app" },
      { text: "Leading Ethereum L2", personality: "L2" },
      { text: "Cheap, fast transactions", personality: "stablecoin" },
      { text: "Building for the real-world", personality: "human" },
    ],
  },
];

const personalityResults = {
  "mini app": {
    title: "Mini App Maven",
    subtitle: "Mobile-first builder",
    description: "You're all about the mobile-first future. You believe in making blockchain accessible through fun, intuitive apps that people can use on the go. The arcade is your playground, and every tap is a transaction.",
    traits: ["INNOVATIVE", "USER-FOCUSED", "MOBILE-FIRST", "PLAYFUL"],
    bgColor: "bg-celo-purple",
    textColor: "text-celo-yellow",
    accentColor: "bg-celo-pink",
  },
  "human": {
    title: "Real Human Being",
    subtitle: "Authenticity advocate",
    description: "You value authenticity and real-world connections. Privacy and verification matter to you, but so does staying true to yourself. You're building bridges between the digital and physical world.",
    traits: ["AUTHENTIC", "PRIVATE", "VERIFIED", "GROUNDED"],
    bgColor: "bg-celo-blue",
    textColor: "text-black",
    accentColor: "bg-white",
  },
  "regen": {
    title: "Regenerative Soul",
    subtitle: "Impact maximalist",
    description: "You're here to make a positive impact. Every transaction is an opportunity to do good, and you believe blockchain can help heal the planet. The community garden is where you thrive.",
    traits: ["IMPACT-DRIVEN", "SUSTAINABLE", "THOUGHTFUL", "CARING"],
    bgColor: "bg-celo-green",
    textColor: "text-celo-yellow",
    accentColor: "bg-celo-lime",
  },
  "L2": {
    title: "L2 Architect",
    subtitle: "Infrastructure maximalist",
    description: "You're all about speed, efficiency, and scalability. You appreciate the technical sophistication of Layer 2 solutions and understand that infrastructure is the foundation of everything.",
    traits: ["TECHNICAL", "EFFICIENT", "SCALABLE", "VISIONARY"],
    bgColor: "bg-celo-orange",
    textColor: "text-black",
    accentColor: "bg-celo-yellow",
  },
  "stablecoin": {
    title: "Stablecoin Pragmatist",
    subtitle: "Real-world maximalist",
    description: "You see the practical value in crypto. Fast, cheap transactions with stable currencies are the killer app. You're making crypto useful for everyday life, one tap-to-pay transaction at a time.",
    traits: ["PRACTICAL", "VALUE-FOCUSED", "ACCESSIBLE", "GLOBAL"],
    bgColor: "bg-celo-yellow",
    textColor: "text-black",
    accentColor: "bg-celo-brown",
  },
};

export function PersonalityQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PersonalityType[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (personality: PersonalityType, answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    setTimeout(() => {
      const newAnswers = [...answers, personality];
      setAnswers(newAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
      }
    }, 200);
  };

  const calculateResult = (): PersonalityType => {
    const counts: Record<PersonalityType, number> = {
      "mini app": 0,
      "human": 0,
      "regen": 0,
      "L2": 0,
      "stablecoin": 0,
    };

    answers.forEach((answer) => {
      counts[answer]++;
    });

    let maxCount = 0;
    let result: PersonalityType = "mini app";

    Object.entries(counts).forEach(([personality, count]) => {
      if (count > maxCount) {
        maxCount = count;
        result = personality as PersonalityType;
      }
    });

    return result;
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
    setSelectedAnswer(null);
  };

  if (showResults) {
    const result = calculateResult();
    const resultData = personalityResults[result];

    return (
      <div className={`min-h-screen ${resultData.bgColor} ${resultData.textColor} p-0 relative overflow-hidden`}>
        {/* Decorative blocks - hidden on mobile, visible on larger screens */}
        <div className={`hidden md:block absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 ${resultData.accentColor} border-4 border-black`}></div>
        <div className={`hidden md:block absolute bottom-0 left-0 w-48 h-24 lg:w-64 lg:h-32 border-4 border-black`}></div>
        
        <div className="relative z-10 min-h-screen flex flex-col justify-center p-4 sm:p-6 md:p-10 lg:p-12 gap-6 md:gap-8 lg:gap-12">
          {/* Header */}
          <div className="text-left max-w-5xl">
            <div className="font-inter text-[10px] sm:text-xs tracking-widest mb-3 md:mb-4 uppercase font-bold">
              YOUR CELO PERSONALITY
            </div>
            <h1 className="font-alpina text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tighter mb-2">
              {resultData.title.split(' ')[0]}{' '}
              <span className="italic">{resultData.title.split(' ').slice(1).join(' ')}</span>
            </h1>
            <div className="font-inter text-base sm:text-lg md:text-xl font-semibold mt-3 md:mt-4 uppercase tracking-tight">
              {resultData.subtitle}
            </div>
          </div>

          {/* Description Block */}
          <div className="max-w-3xl">
            <div className={`border-3 sm:border-4 border-black ${resultData.accentColor} p-5 sm:p-6 md:p-10 lg:p-12`}>
              <p className="font-inter text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-black">
                {resultData.description}
              </p>
            </div>
          </div>

          {/* Traits Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-4xl">
            {resultData.traits.map((trait, index) => (
              <div
                key={index}
                className="border-3 sm:border-4 border-black bg-black text-white p-3 sm:p-4 md:p-6 transition-brutal active:bg-white active:text-black md:hover:bg-white md:hover:text-black"
              >
                <div className="font-inter font-750 text-xs sm:text-sm md:text-base tracking-tight">
                  {trait}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-4xl">
            <button
              onClick={restartQuiz}
              className="flex-1 border-3 sm:border-4 border-black bg-black text-white px-6 sm:px-8 py-4 sm:py-5 md:py-6 font-inter font-750 text-sm sm:text-base md:text-lg uppercase tracking-tight transition-brutal active:bg-white active:text-black md:hover:bg-white md:hover:text-black"
            >
              Take Again
            </button>
            <button
              onClick={() => {
                const text = `I'm a ${resultData.title} on Celo!`;
                if (navigator.share) {
                  navigator.share({
                    title: "My Celo Personality",
                    text: text,
                  });
                } else {
                  navigator.clipboard.writeText(text);
                }
              }}
              className={`flex-1 border-3 sm:border-4 border-black bg-white text-black px-6 sm:px-8 py-4 sm:py-5 md:py-6 font-inter font-750 text-sm sm:text-base md:text-lg uppercase tracking-tight transition-brutal active:bg-black active:text-white md:hover:bg-black md:hover:text-white`}
            >
              Share Result
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-celo-tan text-black p-0 relative overflow-x-hidden">
      {/* Decorative color blocks - responsive sizing */}
      <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-celo-yellow border-3 sm:border-4 border-black"></div>
      <div className="hidden sm:block absolute top-0 right-0 w-16 md:w-24 lg:w-32 h-full bg-celo-green border-l-3 sm:border-l-4 border-black"></div>
      <div className="absolute bottom-0 left-0 w-full h-12 sm:h-14 md:h-16 bg-black"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col p-4 sm:p-6 md:p-10 lg:p-12 max-w-6xl mx-auto">
        {/* Progress Bar - Raw and Brutal */}
        <div className="mb-8 sm:mb-12 md:mb-16 pt-2 sm:pt-4">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <span className="font-inter text-[10px] sm:text-xs uppercase tracking-widest font-bold">
              Q{currentQuestionIndex + 1}/{questions.length}
            </span>
            <span className="font-inter text-[10px] sm:text-xs uppercase tracking-widest font-bold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-white border-3 sm:border-4 border-black h-6 sm:h-7 md:h-8">
            <div
              className="h-full bg-black transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question - Poster-like Typography */}
        <div className="flex-1 flex flex-col justify-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="font-alpina text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tighter mb-8 sm:mb-12 md:mb-16 max-w-4xl">
            {currentQuestion.question.split('…')[0]}
            {currentQuestion.question.includes('…') && (
              <span className="italic">…</span>
            )}
          </h2>

          {/* Answers - Big Blocks */}
          <div className="space-y-0 max-w-3xl">
            {currentQuestion.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer.personality, index)}
                disabled={selectedAnswer !== null}
                className={`w-full border-3 sm:border-4 border-black px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 lg:py-8 font-inter text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-left transition-brutal ${
                  selectedAnswer === index
                    ? "bg-black text-celo-yellow"
                    : "bg-white text-black active:bg-celo-yellow active:text-black md:hover:bg-celo-yellow md:hover:text-black"
                } ${selectedAnswer !== null && selectedAnswer !== index ? "opacity-30" : ""}`}
              >
                {answer.text.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Back Navigation */}
        {currentQuestionIndex > 0 && selectedAnswer === null && (
          <div className="pb-4 sm:pb-6 md:pb-8">
            <button
              onClick={() => {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                setAnswers(answers.slice(0, -1));
              }}
              className="border-3 sm:border-4 border-black bg-celo-brown text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 font-inter font-bold text-xs sm:text-sm uppercase tracking-tight transition-brutal active:bg-black md:hover:bg-black"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

