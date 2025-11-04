"use client"

import Link from "next/link"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-3 sm:border-b-4 border-black bg-celo-yellow">
      <div className="flex h-14 sm:h-16 md:h-20 items-center justify-between px-4 sm:px-6 md:px-10 lg:px-12">
        {/* Logo */}
        <Link href="/" className="transition-brutal active:opacity-70 md:hover:opacity-70">
          <div className="font-alpina text-xl sm:text-2xl md:text-3xl tracking-tighter">
            Celo <span className="italic">Personality</span>
          </div>
        </Link>
        
        {/* Right side - minimal */}
        <div className="font-inter text-[10px] sm:text-xs uppercase tracking-widest font-bold">
          Quiz
        </div>
      </div>
    </header>
  )
}
