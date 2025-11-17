"use client";

import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PoapSuccess } from "./poap-success";

export type PersonalityType =
  | "mini app maxi"
  | "verified human"
  | "impact regen"
  | "L2 believer"
  | "stablecoin savvy";

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
      { text: "arcade", personality: "mini app maxi" },
      { text: "DMV", personality: "verified human" },
      { text: "community garden", personality: "impact regen" },
      { text: "gas station", personality: "L2 believer" },
      { text: "tap-to-pay cafe", personality: "stablecoin savvy" },
    ],
  },
  {
    id: 2,
    question: "What's most likely in your bag?",
    answers: [
      { text: "Testnet tokens", personality: "L2 believer" },
      { text: "Metal straw", personality: "impact regen" },
      {
        text: "Currencies from around the world",
        personality: "stablecoin savvy",
      },
      { text: "My passport", personality: "verified human" },
      { text: "Swiss army knife", personality: "mini app maxi" },
    ],
  },
  {
    id: 3,
    question: "Pick a character",
    answers: [
      { text: "The Mechanic", personality: "mini app maxi" },
      { text: "The Architect", personality: "L2 believer" },
      { text: "The Security Guard", personality: "verified human" },
      { text: "The Philosopher", personality: "impact regen" },
      { text: "The Global Markets Analyst", personality: "stablecoin savvy" },
    ],
  },
  {
    id: 4,
    question: "What's your favorite part of Celo?",
    answers: [
      {
        text: "Carbon offsets built into every transaction",
        personality: "impact regen",
      },
      {
        text: "Privacy-preserving infrastructure",
        personality: "verified human",
      },
      { text: "Paying gas with stablecoins", personality: "stablecoin savvy" },
      {
        text: "Diverse, mobile-first apps to play with",
        personality: "mini app maxi",
      },
      { text: "Rapid block times", personality: "L2 believer" },
    ],
  },
  {
    id: 5,
    question: "Pick a mission statement",
    answers: [
      {
        text: "Rewarding positive externalities to protect public goods",
        personality: "impact regen",
      },
      { text: "Scaling mobile use cases", personality: "mini app maxi" },
      {
        text: "Scaling Ethereum with frontier tech",
        personality: "L2 believer",
      },
      {
        text: "Making financial tools accessible for everyone, everywhere",
        personality: "stablecoin savvy",
      },
      { text: "Building a more human internet", personality: "verified human" },
    ],
  },
];

const personalityResults: Record<
  PersonalityType,
  {
    title: string;
    subtitle: string;
    description: string;
    traits: string[];
    bgColor: string;
    textColor: string;
    accentColor: string;
  }
> = {
  "mini app maxi": {
    title: "Mini App Maxi",
    subtitle: "Mobile-first futurist",
    description:
      "You're all about the mobile-first future. You dream up playful, intuitive experiences that make onchain life feel instant and effortless. The arcade is your playground, and every tap is a transaction.",
    traits: ["INVENTIVE", "USER-FOCUSED", "MOBILE-FIRST", "PLAYFUL"],
    bgColor: "bg-celo-purple",
    textColor: "text-celo-yellow",
    accentColor: "bg-celo-pink",
  },
  "verified human": {
    title: "Verified Human",
    subtitle: "Authenticity advocate",
    description:
      "You value authenticity and real-world connections. Privacy and verification matter to you, but so does staying true to yourself. You're building bridges between the digital and physical world.",
    traits: ["AUTHENTIC", "PRIVATE", "VERIFIED", "GROUNDED"],
    bgColor: "bg-celo-blue",
    textColor: "text-black",
    accentColor: "bg-white",
  },
  "impact regen": {
    title: "Impact Regen",
    subtitle: "Positive-sum champion",
    description:
      "You're here to make a positive impact. Every transaction is an opportunity to do good, and you believe blockchain can help heal the planet. The community garden is where you thrive.",
    traits: ["IMPACT-DRIVEN", "SUSTAINABLE", "THOUGHTFUL", "CARING"],
    bgColor: "bg-celo-green",
    textColor: "text-celo-yellow",
    accentColor: "bg-celo-lime",
  },
  "L2 believer": {
    title: "L2 Believer",
    subtitle: "Infrastructure visionary",
    description:
      "You're all about speed, efficiency, and scalability. You appreciate the technical sophistication of Layer 2 solutions and understand that infrastructure is the foundation of everything.",
    traits: ["TECHNICAL", "EFFICIENT", "SCALABLE", "VISIONARY"],
    bgColor: "bg-celo-orange",
    textColor: "text-black",
    accentColor: "bg-celo-yellow",
  },
  "stablecoin savvy": {
    title: "Stablecoin Savvy",
    subtitle: "Real-world maximalist",
    description:
      "You see the practical value in crypto. Fast, cheap transactions with stable currencies are the killer app. You're making crypto useful for everyday life, one tap-to-pay transaction at a time.",
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
  const [isMinting, setIsMinting] = useState(false);
  const [poapMinted, setPoapMinted] = useState(false);
  const [mintData, setMintData] = useState<{
    tokenId: number;
    eventId: number;
    claimedDate: string;
    event: {
      id: number;
      fancy_id: string;
      name: string;
      description: string;
      image_url: string;
      year: number;
      start_date: string;
      end_date: string;
    } | null;
  } | null>(null);
  const { address } = useWalletConnection();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Hide navbar when quiz is active
  useEffect(() => {
    document.body.classList.add("quiz-active");
    return () => {
      document.body.classList.remove("quiz-active");
    };
  }, []);

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
      "mini app maxi": 0,
      "verified human": 0,
      "impact regen": 0,
      "L2 believer": 0,
      "stablecoin savvy": 0,
    };

    answers.forEach((answer) => {
      counts[answer]++;
    });

    let maxCount = 0;
    let result: PersonalityType = "mini app maxi";

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
    setPoapMinted(false);
    setMintData(null);
  };

  const handleMintPOAP = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    const result = calculateResult();
    setIsMinting(true);

    try {
      const response = await fetch("/api/poap/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalityType: result,
          address: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Parse and show clean error message
        let errorMessage = "Failed to mint POAP";
        if (data.error) {
          // Try to extract clean message from error string
          try {
            const errorObj =
              typeof data.error === "string"
                ? JSON.parse(data.error)
                : data.error;
            errorMessage = errorObj.message || errorObj.error || data.error;
          } catch {
            errorMessage = data.error;
          }
        }
        toast.error(errorMessage);
        return;
      }

      // Store mint data and show success screen
      if (data.success && data.tokenId && data.eventId) {
        setMintData({
          tokenId: data.tokenId,
          eventId: data.eventId,
          claimedDate: data.claimedDate,
          event: data.event,
        });
        setPoapMinted(true);
        // Show different message if user already owned the POAP
        if (data.alreadyOwned) {
          toast.success("You already have this POAP!");
        } else {
          toast.success("POAP minted successfully!");
        }
      }
    } catch (error) {
      console.error("Minting error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsMinting(false);
    }
  };

  // Show POAP success screen if minted
  if (poapMinted && mintData) {
    const result = calculateResult();
    return (
      <PoapSuccess
        tokenId={mintData.tokenId}
        eventId={mintData.eventId}
        claimedDate={mintData.claimedDate}
        address={address || ""}
        personalityType={result}
        initialEventData={mintData.event}
      />
    );
  }

  if (showResults) {
    const result = calculateResult();
    const resultData = personalityResults[result];

    return (
      <div
        className={`min-h-screen ${resultData.bgColor} ${resultData.textColor} p-0 relative overflow-hidden`}
      >
        {/* Decorative blocks - hidden on mobile, visible on larger screens */}
        <div
          className={`hidden md:block absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 ${resultData.accentColor} border-4 border-black`}
        ></div>
        <div
          className={`hidden md:block absolute bottom-0 left-0 w-48 h-24 lg:w-64 lg:h-32 border-4 border-black`}
        ></div>

        <div className="relative z-10 min-h-screen flex flex-col justify-center p-4 sm:p-6 md:p-10 lg:p-12 gap-6 md:gap-8 lg:gap-12">
          {/* Header */}
          <div className="text-left max-w-5xl">
            <div className="font-inter text-[10px] sm:text-xs tracking-widest mb-3 md:mb-4 uppercase font-bold">
              YOUR CELO PERSONALITY
            </div>
            <h1 className="font-alpina text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tighter mb-2">
              {resultData.title.split(" ")[0]}{" "}
              <span className="italic">
                {resultData.title.split(" ").slice(1).join(" ")}
              </span>
            </h1>
            <div className="font-inter text-base sm:text-lg md:text-xl font-semibold mt-3 md:mt-4 uppercase tracking-tight">
              {resultData.subtitle}
            </div>
          </div>

          {/* Description Block */}
          <div className="max-w-3xl">
            <div
              className={`border-brutal-container ${resultData.accentColor} p-5 sm:p-6 md:p-10 lg:p-12`}
            >
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
                className="border-brutal-container bg-black text-white p-3 sm:p-4 md:p-6 select-none"
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
              onClick={handleMintPOAP}
              disabled={isMinting || !address}
              className="flex-1 btn-brutal bg-white text-black px-6 sm:px-8 py-4 sm:py-5 md:py-6 font-inter font-750 text-sm sm:text-base md:text-lg uppercase tracking-tight md:hover:bg-black md:hover:text-white active:bg-black active:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMinting ? "MINTING..." : "MINT POAP"}
            </button>
            <button
              onClick={restartQuiz}
              className="flex-1 btn-brutal bg-black text-white px-6 sm:px-8 py-4 sm:py-5 md:py-6 font-inter font-750 text-sm sm:text-base md:text-lg uppercase tracking-tight md:hover:bg-white md:hover:text-black active:bg-white active:text-black"
            >
              Take Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-celo-tan text-black p-0 relative overflow-hidden flex flex-col">
      {/* Yellow Header Bar */}
      <div className="w-full bg-celo-yellow border-b-3 sm:border-b-4 border-black">
        <div className="flex h-14 sm:h-16 md:h-20 items-center justify-between px-4 sm:px-6 md:px-10 lg:px-12">
          <div className="font-alpina text-xl sm:text-2xl md:text-3xl tracking-tighter">
            Celo <span className="italic">Personality</span>
          </div>
          <div className="font-inter text-[10px] sm:text-xs uppercase tracking-widest font-bold">
            QUIZ
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="max-w-2xl mx-auto w-full">
            {/* Progress Bar */}
            <div className="mb-6 sm:mb-8 md:mb-10">
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
            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="font-alpina text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tighter mb-8 sm:mb-10 md:mb-12">
                {currentQuestion.question.split("…")[0]}
                {currentQuestion.question.includes("…") && (
                  <span className="italic">…</span>
                )}
              </h2>

              {/* Answers - Beautiful Blocks */}
              <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
                {currentQuestion.answers.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(answer.personality, index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full btn-brutal px-5 sm:px-6 md:px-8 py-5 sm:py-6 md:py-7 font-inter text-base sm:text-lg md:text-xl font-semibold text-left ${
                      selectedAnswer === index
                        ? "bg-black text-celo-yellow"
                        : "bg-white text-black md:hover:bg-celo-yellow md:hover:text-black active:bg-celo-yellow active:text-black"
                    } ${
                      selectedAnswer !== null && selectedAnswer !== index
                        ? ""
                        : ""
                    }`}
                  >
                    <span className="relative z-10">
                      {answer.text.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Back Navigation */}
            {currentQuestionIndex > 0 && selectedAnswer === null && (
              <div className="mt-8 sm:mt-10 pt-4 sm:pt-6">
                <button
                  onClick={() => {
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                    setAnswers(answers.slice(0, -1));
                  }}
                  className="btn-brutal bg-black text-white px-6 sm:px-8 py-4 sm:py-5 md:py-6 font-inter font-750 text-sm sm:text-base md:text-lg uppercase tracking-tight md:hover:bg-white md:hover:text-black active:bg-white active:text-black"
                >
                  BACK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
