'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Loader2, Mail, Calendar, ChevronDown } from 'lucide-react'
import { BlogChart } from './blog-chart'

// Types
interface FormData {
  taskType: string
  customTaskType?: string
  hoursPerWeek: string
  hourlyRate: string
  peopleCount: string
  judgmentLevel: string
  processDescription: string
  email: string
}

interface ROIResult {
  isViable: boolean
  exitReason?: string
  timeBefore: number
  timeAfter: number
  savingsPercentage: number
  monthlySavingsLow: number
  monthlySavingsHigh: number
  yearlySavingsLow: number
  yearlySavingsHigh: number
  automationExplanation: string
}

// Constants
const TASK_TYPES = [
  'Invoice Processing',
  'Data Entry',
  'Customer Support',
  'Reporting',
]

const HOURS_OPTIONS = [
  { label: 'Less than 2 hours', value: '1.5', numericValue: 1.5 },
  { label: '2-10 hours', value: '6', numericValue: 6 },
  { label: '10-30 hours', value: '20', numericValue: 20 },
  { label: '30+ hours', value: '40', numericValue: 40 },
]

const HOURLY_RATE_OPTIONS = [
  { label: '€15-30/hour', value: '22.5', numericValue: 22.5 },
  { label: '€30-50/hour', value: '40', numericValue: 40 },
  { label: '€50-80/hour', value: '65', numericValue: 65 },
  { label: '€80+/hour', value: '100', numericValue: 100 },
]

const PEOPLE_COUNT_OPTIONS = [
  { label: '1 person', value: '1', numericValue: 1 },
  { label: '2-3 people', value: '2.5', numericValue: 2.5 },
  { label: '4-6 people', value: '5', numericValue: 5 },
  { label: '7+ people', value: '10', numericValue: 10 },
]

const JUDGMENT_OPTIONS = [
  { 
    label: 'Fully rule-based', 
    description: 'Every step follows clear, predictable rules',
    value: 'none',
    reduction: 0.90 
  },
  { 
    label: 'Mostly automated', 
    description: 'Some edge cases need occasional review',
    value: 'low',
    reduction: 0.75 
  },
  { 
    label: 'Hybrid process', 
    description: 'One critical decision point requires human input',
    value: 'medium',
    reduction: 0.50 
  },
  { 
    label: 'Highly complex', 
    description: 'Most steps require human judgment',
    value: 'high',
    reduction: 0 
  },
]

const TOTAL_STEPS = 6

export function ROICalculator({ embed = false }: { embed?: boolean }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    taskType: '',
    customTaskType: '',
    hoursPerWeek: '',
    hourlyRate: '',
    peopleCount: '',
    judgmentLevel: '',
    processDescription: '',
    email: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ROIResult | null>(null)
  const [exitMessage, setExitMessage] = useState<string | null>(null)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [hasUserScrolled, setHasUserScrolled] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resultsScrollRef = useRef<HTMLDivElement>(null)

  const progress = (currentStep / TOTAL_STEPS) * 100

  // Check if content is scrollable for scroll indicator
  useEffect(() => {
    if (result && !hasUserScrolled) {
      const timeout = setTimeout(() => {
        const container = resultsScrollRef.current
        if (!container) return
        
        // Check if content is actually scrollable
        if (container.scrollHeight > container.clientHeight) {
          setShowScrollIndicator(true)
        } else {
          setShowScrollIndicator(false)
        }
      }, 500)
      
      return () => clearTimeout(timeout)
    }
  }, [result, hasUserScrolled])

  // Check exit conditions
  const checkEarlyExit = (step: number, data: FormData): string | null => {
    // After step 4 (people count), check total hours
    if (step === 4) {
      const hours = parseFloat(data.hoursPerWeek) || 0
      const people = parseFloat(data.peopleCount) || 1
      const totalHours = hours * people
      
      if (totalHours <= 2) {
        return "Based on your inputs, this task takes less than 2 hours a week. Automation typically isn't cost-effective for tasks this small. Consider batching this with other processes or revisiting when the workload increases."
      }
    }
    
    // After step 5 (judgment level), check if too complex
    if (step === 5 && data.judgmentLevel === 'high') {
      return "This process requires significant human judgment at most steps. Current automation technology works best with predictable, rule-based tasks. We'd recommend focusing on automating the supporting tasks around this core process instead."
    }
    
    return null
  }

  const handleOptionSelect = (field: keyof FormData, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    
    // Check for early exit
    const exitReason = checkEarlyExit(currentStep + 1, newData)
    if (exitReason) {
      setExitMessage(exitReason)
      return
    }
    
    // Auto-advance after selection (with small delay for UX)
    setTimeout(() => {
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(currentStep + 1)
      }
    }, 200)
  }

  const handleCustomTaskSubmit = () => {
    if (formData.customTaskType?.trim()) {
      const newData = { ...formData, taskType: formData.customTaskType.trim() }
      setFormData(newData)
      setCurrentStep(1)
    }
  }

  const handleProcessSubmit = async () => {
    if (!formData.processDescription.trim()) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/roi-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      })
      
      if (!response.ok) throw new Error('Failed to calculate ROI')
      
      const data = await response.json()
      
      if (data.exitReason) {
        setExitMessage(data.exitReason)
      } else {
        setResult(data)
      }
    } catch (error) {
      console.error('Error:', error)
      setExitMessage('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async () => {
    if (!formData.email.trim()) return
    
    // In production, send email with report
    // For now, just show confirmation
    setEmailSent(true)
    setShowEmailCapture(false)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetCalculator = () => {
    setCurrentStep(0)
    setFormData({
      taskType: '',
      customTaskType: '',
      hoursPerWeek: '',
      hourlyRate: '',
      peopleCount: '',
      judgmentLevel: '',
      processDescription: '',
      email: '',
    })
    setResult(null)
    setExitMessage(null)
    setShowEmailCapture(false)
    setEmailSent(false)
    setHasUserScrolled(false)
    setShowScrollIndicator(false)
  }

  const containerHeight = embed 
    ? 'h-[500px] max-h-[70vh] min-h-[400px]' 
    : 'h-[600px] max-h-[80vh] min-h-[450px]'

  // Render current step content
  const renderStep = () => {
    // Exit message screen
    if (exitMessage) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center text-center min-h-full">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#CF6679]/15 flex items-center justify-center mb-4 sm:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-[#CF6679]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
                Not the Right Fit for Automation
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-md">
                {exitMessage}
              </p>
            </div>
          </div>
          <div className="p-4 border-t border-foreground/[0.06] flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={resetCalculator}
              className="flex-1 px-4 py-3 text-sm rounded-full border border-foreground/[0.1] text-foreground
                hover:bg-foreground/[0.05] transition-colors"
            >
              Try Another Process
            </button>
            <a
              href="https://cal.com/tiago-lemos-p1wrn8/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 text-sm rounded-full bg-primary text-primary-foreground text-center
                hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Discuss Alternatives
            </a>
          </div>
        </div>
      )
    }

    // Results screen
    if (result) {
      const chartConfig = {
        type: 'bar' as const,
        title: 'Weekly Hours: Before vs After Automation',
        data: [
          { category: 'Current Process', hours: result.timeBefore },
          { category: 'With Automation', hours: result.timeAfter },
        ],
        xKey: 'category',
        yKey: 'hours',
        height: 250,
      }

      return (
        <div
          className="flex flex-col h-full overflow-hidden"
        >
          <div 
            ref={resultsScrollRef}
            onScroll={() => {
              setHasUserScrolled(true)
              setShowScrollIndicator(false)
            }}
            className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 scrollbar-hide"
          >
            {/* ROI Highlight */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Estimated Monthly Savings</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                €{result.monthlySavingsLow.toLocaleString()} - €{result.monthlySavingsHigh.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                €{result.yearlySavingsLow.toLocaleString()} - €{result.yearlySavingsHigh.toLocaleString()} per year
              </p>
            </div>

            {/* Chart */}
            <div className="mb-4 sm:mb-6">
              <BlogChart config={chartConfig} />
            </div>

            {/* AI Explanation */}
            <div className="bg-foreground/[0.03] rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
              <h4 className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">How This Could Work</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {result.automationExplanation}
              </p>
            </div>

            {/* Email Capture */}
            {!emailSent && (
              <div className="bg-foreground/[0.03] rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                {!showEmailCapture ? (
                  <button
                    onClick={() => setShowEmailCapture(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Send me this report
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="flex-1 bg-background border border-foreground/[0.1] rounded-lg px-3 py-2 text-sm
                        text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleEmailSubmit}
                      disabled={!formData.email.trim()}
                      className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground
                        hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            )}
            {emailSent && (
              <p className="text-sm text-center text-muted-foreground mb-4">
                ✓ Report sent to your email
              </p>
            )}
          </div>

          {/* Scroll indicator */}
          {showScrollIndicator && !hasUserScrolled && (
            <div className="flex justify-center py-2 border-t border-foreground/[0.06]">
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          )}

          {/* Actions */}
          <div className="p-3 sm:p-4 border-t border-foreground/[0.06] flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={resetCalculator}
              className="flex-1 px-4 py-2.5 sm:py-3 text-sm rounded-full border border-foreground/[0.1] text-foreground
                hover:bg-foreground/[0.05] transition-colors"
            >
              Calculate Another
            </button>
            <a
              href="https://cal.com/tiago-lemos-p1wrn8/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 sm:py-3 text-sm rounded-full bg-primary text-primary-foreground text-center
                hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book a Discovery Call
            </a>
          </div>
        </div>
      )
    }

    // Step content
    switch (currentStep) {
      case 0: // Task Type
        return (
          <StepContainer
            title="What type of task do you want to automate?"
            showBack={false}
          >
            <div className="space-y-2 sm:space-y-3">
              {TASK_TYPES.map((type) => (
                <OptionButton
                  key={type}
                  label={type}
                  selected={formData.taskType === type}
                  onClick={() => handleOptionSelect('taskType', type)}
                />
              ))}
              
              <div className="pt-4 sm:pt-6 mt-2 sm:mt-3 border-t border-foreground/[0.06]">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">Or describe your own</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.customTaskType}
                    onChange={(e) => setFormData({ ...formData, customTaskType: e.target.value })}
                    placeholder="E.g., Order fulfillment, HR onboarding..."
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 pr-14 sm:pr-16 text-sm
                      text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomTaskSubmit()}
                  />
                  <button
                    onClick={handleCustomTaskSubmit}
                    disabled={!formData.customTaskType?.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-primary
                      hover:text-primary/80 transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </StepContainer>
        )

      case 1: // Hours per week
        return (
          <StepContainer
            title="How much time do you spend on this per week?"
            onBack={handleBack}
          >
            <div className="space-y-2 sm:space-y-3">
              {HOURS_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  selected={formData.hoursPerWeek === option.value}
                  onClick={() => handleOptionSelect('hoursPerWeek', option.value)}
                />
              ))}
            </div>
          </StepContainer>
        )

      case 2: // Hourly rate
        return (
          <StepContainer
            title="What's the hourly cost of labor for this task?"
            onBack={handleBack}
          >
            <div className="space-y-2 sm:space-y-3">
              {HOURLY_RATE_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  selected={formData.hourlyRate === option.value}
                  onClick={() => handleOptionSelect('hourlyRate', option.value)}
                />
              ))}
            </div>
          </StepContainer>
        )

      case 3: // People count
        return (
          <StepContainer
            title="How many people work on this task?"
            onBack={handleBack}
          >
            <div className="space-y-2 sm:space-y-3">
              {PEOPLE_COUNT_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  selected={formData.peopleCount === option.value}
                  onClick={() => handleOptionSelect('peopleCount', option.value)}
                />
              ))}
            </div>
          </StepContainer>
        )

      case 4: // Human judgment level
        return (
          <StepContainer
            title="How much human judgment does this process require?"
            onBack={handleBack}
          >
            <div className="space-y-2 sm:space-y-3">
              {JUDGMENT_OPTIONS.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={formData.judgmentLevel === option.value}
                  onClick={() => handleOptionSelect('judgmentLevel', option.value)}
                />
              ))}
            </div>
          </StepContainer>
        )

      case 5: // Process description
        return (
          <StepContainer
            title="Describe your current process"
            subtitle="Help us understand how you currently handle this task"
            onBack={handleBack}
          >
            <div className="space-y-3 sm:space-y-4">
              <textarea
                ref={textareaRef}
                value={formData.processDescription}
                onChange={(e) => setFormData({ ...formData, processDescription: e.target.value })}
                placeholder="E.g., We receive invoices via email, manually enter data into our ERP, cross-check against purchase orders, then route for approval..."
                rows={4}
                className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm
                  text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary
                  resize-none"
              />
              <button
                onClick={handleProcessSubmit}
                disabled={!formData.processDescription.trim() || isLoading}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl bg-primary text-primary-foreground
                  hover:bg-primary/90 transition-colors font-medium disabled:opacity-50
                  flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing your process...
                  </>
                ) : (
                  <>
                    Calculate ROI
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </StepContainer>
        )

      default:
        return null
    }
  }

  return (
    <div className={`flex flex-col ${containerHeight} w-full max-w-2xl mx-auto bg-background rounded-xl border border-foreground/[0.06] overflow-hidden`}>
      {/* Header with progress */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-foreground/[0.06] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {!result && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
            <span className="text-sm font-medium text-foreground">ROI Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-foreground">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-sm font-medium text-foreground">Done</span>
              </div>
            )}
            {embed && (
              <a 
                href="https://www.nodewave.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Powered by Node Wave
              </a>
            )}
          </div>
        </div>
        {/* Progress bar - always reserve space */}
        <div className="h-1 w-full bg-foreground/[0.06] rounded-full overflow-hidden">
          {result ? (
            <div className="h-full w-full bg-primary rounded-full" />
          ) : !exitMessage && (
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={exitMessage ? 'exit' : result ? 'result' : currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Sub-components
function StepContainer({ 
  title, 
  subtitle,
  children, 
  showBack = true,
  onBack 
}: { 
  title: string
  subtitle?: string
  children: React.ReactNode
  showBack?: boolean
  onBack?: () => void
}) {
  return (
    <div className="flex flex-col h-full p-4 sm:p-6">
      {showBack && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 sm:mb-4 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}
      <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">{title}</h2>
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-3 sm:mb-4">{subtitle}</p>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {children}
      </div>
    </div>
  )
}

function OptionButton({ 
  label, 
  description,
  selected, 
  onClick 
}: { 
  label: string
  description?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all ${
        selected 
          ? 'border-primary bg-primary/10 text-foreground' 
          : 'border-foreground/[0.08] bg-foreground/[0.02] text-foreground hover:border-foreground/[0.15] hover:bg-foreground/[0.04]'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      {description && (
        <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>
      )}
    </button>
  )
}
