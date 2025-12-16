import React from "react"
import { Button } from "@/components/ui/button"
import { Header } from "./header"
import Link from "next/link"
import RotatingEarth from "./rotating-earth"

export function HeroSection() {
  return (
    <section
      className="flex flex-col items-center text-center relative mx-auto rounded-2xl overflow-hidden my-6 py-0 px-4 contain-content
         w-full h-[750px] md:w-[1220px] md:h-[950px] lg:h-[1150px] md:px-0"
    >
      {/* CSS Grid Background - top */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
        }}
      />

      {/* Filled grid squares - aligned to 36px grid, opacity increases left to right */}
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.04] top-[72px] left-[720px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.03] top-[144px] left-[180px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.09] top-[144px] left-[1008px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.02] top-[216px] left-[108px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.09] top-[216px] left-[1080px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.08] top-[288px] left-[936px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.03] top-[324px] left-[216px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.04] top-[396px] left-[288px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.02] top-[396px] left-[72px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.05] top-[396px] left-[504px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.07] top-[396px] left-[756px] hidden md:block" />
      <div className="absolute w-[36px] h-[36px] bg-foreground/[0.05] top-[468px] left-[576px] hidden md:block" />

      {/* CSS Grid Background - bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[150px] z-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        }}
      />

      {/* Gradient blob - bottom */}
      <div 
        className="absolute bottom-0 left-1/2 w-[600px] h-[200px] opacity-10 blur-[80px] z-0"
        style={{
          background: 'radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 70%)',
          transform: 'translate(-50%, 85%)',
        }}
      />
      
      {/* Gradient blob - simplified */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] opacity-25 blur-[80px] z-0"
        style={{
          background: 'radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />

      {/* Border */}
      <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06] z-0" />

      {/* Header positioned at top of hero container */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <Header />
      </div>

      <div className="relative z-10 space-y-4 md:space-y-5 lg:space-y-6 mb-6 md:mb-7 lg:mb-9 max-w-md md:max-w-[500px] lg:max-w-[588px] mt-16 md:mt-[120px] lg:mt-[160px] px-4">
        <h1 className="text-foreground text-3xl md:text-4xl lg:text-6xl font-semibold leading-tight">
          Transform Your Business with AI Automation
        </h1>
        <p className="text-muted-foreground text-base md:text-base lg:text-lg font-medium leading-relaxed max-w-lg mx-auto">
          Unlock unprecedented growth with intelligent automation that scales. From lead generation to customer support, we build AI that works 24/7.
        </p>
      </div>

      <Link href="#contact-section">
        <Button className="relative z-10 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3 rounded-full font-medium text-base shadow-lg ring-1 ring-white/10">
          Get Started
        </Button>
      </Link>

      <div className="relative z-10 mt-8 md:mt-12 w-full max-w-[600px] lg:max-w-[700px]">
        <RotatingEarth width={700} height={500} className="mx-auto" />
        <p className="text-center text-muted-foreground text-base md:text-lg mt-4">Based in Europe, automating worldwide</p>
      </div>
    </section>
  )
}
