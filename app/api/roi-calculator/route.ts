import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Lazy-load OpenRouter client (OpenAI-compatible API)
let openrouter: OpenAI | null = null
function getOpenRouter() {
  if (!openrouter) {
    openrouter = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })
  }
  return openrouter
}

interface FormData {
  taskType: string
  customTaskType?: string
  hoursPerWeek: string
  hourlyRate: string
  peopleCount: string
  judgmentLevel: string
  processDescription: string
}

// Reduction percentages based on judgment level
const REDUCTION_MAP: Record<string, number> = {
  'none': 0.90,   // Fully rule-based: 90% reduction
  'low': 0.75,    // Mostly automated: 75% reduction
  'medium': 0.50, // Hybrid: 50% reduction
  'high': 0,      // Too complex: no automation (should be caught earlier)
}

function buildAnalysisPrompt(formData: FormData): string {
  const judgmentDescriptions: Record<string, string> = {
    'none': 'fully rule-based with no human judgment needed',
    'low': 'mostly automated with occasional edge case review',
    'medium': 'hybrid with one critical human decision point',
    'high': 'highly complex requiring significant human judgment',
  }

  return `You are an automation consultant evaluating if a business process can be automated using n8n (a workflow automation tool).

TASK DETAILS:
- Task Type: ${formData.taskType}
- Hours per week: ${formData.hoursPerWeek}
- People involved: ${formData.peopleCount}
- Judgment level: ${judgmentDescriptions[formData.judgmentLevel] || formData.judgmentLevel}

USER'S PROCESS DESCRIPTION:
${formData.processDescription}

ANALYSIS INSTRUCTIONS:

1. First, evaluate if this process is actually automatable based on the description. Even if the user selected a low judgment level, their description might reveal complexities. Look for:
   - Unpredictable decision-making requirements
   - Heavy reliance on human intuition or creativity
   - Highly variable inputs that can't be categorized
   - Legal/compliance requirements that need human oversight

2. If the process is NOT a good fit for automation, respond with:
[NOT_VIABLE]
Brief explanation of why automation isn't recommended for this specific process.
[/NOT_VIABLE]

3. If the process IS a good fit, respond with a 2-3 paragraph explanation of:
   - What parts of the process would be automated (be specific based on their description)
   - How n8n would handle this (mention relevant integrations like email, ERP, databases, etc.)
   - What the human role would look like after automation (monitoring, exception handling, final approvals)
   - Set realistic expectations - don't oversell

Keep the explanation non-technical and conversational. Focus on the business outcome, not technical implementation details. Be honest about limitations.

DO NOT use bullet points or lists. Write in natural prose paragraphs.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData } = body as { formData: FormData }

    if (!formData) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    // Parse numeric values
    const hoursPerWeek = parseFloat(formData.hoursPerWeek) || 0
    const hourlyRate = parseFloat(formData.hourlyRate) || 0
    const peopleCount = parseFloat(formData.peopleCount) || 1
    const reduction = REDUCTION_MAP[formData.judgmentLevel] || 0.5

    // Calculate base metrics
    const totalWeeklyHours = hoursPerWeek * peopleCount
    const timeAfter = totalWeeklyHours * (1 - reduction)
    const hoursSaved = totalWeeklyHours - timeAfter
    
    // Monthly calculations (4.33 weeks per month)
    const weeksPerMonth = 4.33
    const monthlyHoursSaved = hoursSaved * weeksPerMonth
    const baseMonthlySavings = monthlyHoursSaved * hourlyRate
    
    // Add ±20% range for uncertainty
    const monthlySavingsLow = Math.round(baseMonthlySavings * 0.80)
    const monthlySavingsHigh = Math.round(baseMonthlySavings * 1.20)
    const yearlySavingsLow = monthlySavingsLow * 12
    const yearlySavingsHigh = monthlySavingsHigh * 12

    // Call AI to analyze the process and generate explanation
    const systemPrompt = buildAnalysisPrompt(formData)

    const completion = await getOpenRouter().chat.completions.create({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Analyze this process and provide your assessment.' }
      ],
      temperature: 0.7,
      max_tokens: 800,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''

    // Check if AI flagged as not viable
    const notViableMatch = aiResponse.match(/\[NOT_VIABLE\]([\s\S]*?)\[\/NOT_VIABLE\]/i)
    if (notViableMatch) {
      return NextResponse.json({
        isViable: false,
        exitReason: notViableMatch[1].trim(),
      })
    }

    // Return successful result
    return NextResponse.json({
      isViable: true,
      timeBefore: Math.round(totalWeeklyHours * 10) / 10,
      timeAfter: Math.round(timeAfter * 10) / 10,
      savingsPercentage: Math.round(reduction * 100),
      monthlySavingsLow,
      monthlySavingsHigh,
      yearlySavingsLow,
      yearlySavingsHigh,
      automationExplanation: aiResponse.trim(),
    })

  } catch (error) {
    console.error('ROI Calculator API error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
