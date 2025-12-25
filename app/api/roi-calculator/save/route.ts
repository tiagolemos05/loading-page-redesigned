import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { formData, result } = body

    if (!formData || !result) {
      return NextResponse.json(
        { error: 'Missing form data or result' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('roi_calculations')
      .insert({
        task_type: formData.taskType,
        hours_per_week: parseFloat(formData.hoursPerWeek),
        hourly_rate: parseFloat(formData.hourlyRate),
        people_count: parseFloat(formData.peopleCount),
        judgment_level: formData.judgmentLevel,
        process_description: formData.processDescription,
        time_before: result.timeBefore,
        time_after: result.timeAfter,
        monthly_savings_low: result.monthlySavingsLow,
        monthly_savings_high: result.monthlySavingsHigh,
        yearly_savings_low: result.yearlySavingsLow,
        yearly_savings_high: result.yearlySavingsHigh,
        automation_explanation: result.automationExplanation,
        email: formData.email || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save calculation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Error saving ROI calculation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
