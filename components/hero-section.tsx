import React from "react"
import { Button } from "@/components/ui/button"
import { Header } from "./header"
import Link from "next/link"
import RotatingEarth from "./rotating-earth"

export function HeroSection() {
  return (
    <section
      className="flex flex-col items-center text-center relative mx-auto overflow-hidden py-0 px-4 contain-content
         w-full pb-12 md:rounded-2xl md:my-6 md:w-[1220px] md:h-[950px] lg:h-[1150px] md:px-0 md:pb-0"
    >
      {/* CSS Grid Background - top */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundSize: '24px 24px',
        }}
      >
        <div 
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute inset-0 hidden md:block"
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
      </div>

      {/* Filled grid squares - mobile positions (24px grid, opacity higher near top-right light source) */}
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.08] top-[48px] left-[288px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.03] top-[72px] left-[24px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.07] top-[96px] left-[264px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.04] top-[120px] left-[144px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.02] top-[168px] left-[48px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.05] top-[192px] left-[312px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.03] top-[240px] left-[192px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.06] top-[264px] left-[96px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.04] top-[288px] left-[264px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.02] top-[336px] left-[72px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.03] top-[360px] left-[216px] md:hidden" />
      <div className="absolute w-[24px] h-[24px] bg-foreground/[0.04] top-[408px] left-[144px] md:hidden" />

      {/* Filled grid squares - desktop positions */}
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
      <div className="absolute bottom-0 left-0 right-0 h-[150px] z-0 opacity-[0.04]">
        <div 
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />
        <div 
          className="absolute inset-0 hidden md:block"
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
      </div>

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

      {/* Border - hidden on mobile */}
      <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06] z-0 hidden md:block" />

      {/* Header positioned at top of hero container */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <Header />
      </div>

      <div className="relative z-10 space-y-3 md:space-y-5 lg:space-y-6 mb-4 md:mb-7 lg:mb-9 max-w-md md:max-w-[800px] lg:max-w-[900px] mt-20 md:mt-[120px] lg:mt-[160px] px-4">
        <h1 className="text-foreground text-2xl md:text-4xl lg:text-6xl font-semibold leading-tight max-w-md md:max-w-[500px] lg:max-w-[588px] mx-auto">
          Custom Automation for Your Business Operations
        </h1>
        <p className="text-muted-foreground text-sm md:text-base lg:text-lg font-medium leading-relaxed mx-auto">
          <span className="md:hidden">We automate the repetitive work slowing your team down.</span>
          <span className="hidden md:inline">We build tailored automation solutions that streamline your internal processes. From Salesforce workflows to intelligent document handling, we solve the bottlenecks slowing your team down.</span>
        </p>
      </div>

      <Link href="#contact-section">
        <Button className="relative z-10 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3 rounded-full font-medium text-base shadow-lg ring-1 ring-white/10">
          Get Started
        </Button>
      </Link>

      <div className="relative z-10 mt-10 md:mt-12 w-[85vw] max-w-[320px] md:max-w-[600px] lg:max-w-[700px] mx-auto">
        <RotatingEarth width={700} height={500} className="mx-auto w-full" />
        <p className="text-center text-muted-foreground text-xs md:text-base lg:text-lg mt-2 md:mt-4">Based in Europe, automating worldwide</p>
      </div>
    </section>
  )
}
