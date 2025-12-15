import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="w-full pt-20 md:pt-60 lg:pt-60 pb-10 md:pb-20 px-5 relative flex flex-col justify-center items-center overflow-visible">
      {/* Simple CSS gradient instead of heavy SVG filter */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 blur-[60px]"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 flex flex-col justify-start items-center gap-9 max-w-4xl mx-auto">
        <div className="flex flex-col justify-start items-center gap-4 text-center">
          <h2 className="text-foreground text-4xl md:text-5xl lg:text-[68px] font-semibold leading-tight md:leading-tight lg:leading-[76px] break-words max-w-[435px]">
            Ready to Transform Your Business?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base font-medium leading-[18.20px] md:leading-relaxed break-words max-w-2xl">
            Let's discuss how AI automation can drive your growth. From lead generation to customer support, we build AI that works 24/7.
          </p>
        </div>
        <Link href="#contact-section">
          <Button
            className="px-[30px] py-2 bg-secondary text-secondary-foreground text-base font-medium leading-6 rounded-[99px] shadow-[0px_0px_0px_4px_rgba(255,255,255,0.13)] hover:bg-secondary/90 transition-all duration-200"
            size="lg"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  )
}
