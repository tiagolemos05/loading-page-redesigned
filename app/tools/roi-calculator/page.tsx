import { Metadata } from 'next'
import { ROICalculator } from '@/components/roi-calculator'

export const metadata: Metadata = {
  title: 'AI Automation ROI Calculator - Node Wave',
  description: 'Calculate the potential return on investment for automating your business processes with AI.',
  openGraph: {
    type: 'website',
    url: 'https://www.nodewave.io/tools/roi-calculator',
    title: 'AI Automation ROI Calculator - Node Wave',
    description: 'Calculate the potential return on investment for automating your business processes with AI.',
  },
  alternates: {
    canonical: 'https://www.nodewave.io/tools/roi-calculator',
  },
}

export default function ROICalculatorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
              AI Automation ROI Calculator
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover how much time and money you could save by automating your processes.
            </p>
          </div>
          <ROICalculator />
        </div>
      </main>
    </div>
  )
}
