-- ROI Calculator submissions table
-- Run this in Supabase SQL Editor

CREATE TABLE roi_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Form inputs
  task_type TEXT NOT NULL,
  hours_per_week DECIMAL NOT NULL,
  hourly_rate DECIMAL NOT NULL,
  people_count DECIMAL NOT NULL,
  judgment_level TEXT NOT NULL,
  process_description TEXT NOT NULL,
  
  -- Calculated results
  time_before DECIMAL NOT NULL,
  time_after DECIMAL NOT NULL,
  monthly_savings_low DECIMAL NOT NULL,
  monthly_savings_high DECIMAL NOT NULL,
  yearly_savings_low DECIMAL NOT NULL,
  yearly_savings_high DECIMAL NOT NULL,
  automation_explanation TEXT,
  
  -- User contact (optional - filled when they request email report)
  email TEXT,
  
  -- Cal.com booking association
  calcom_booking_id TEXT,
  calcom_booking_email TEXT,
  booked_at TIMESTAMPTZ,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Source tracking
  source TEXT DEFAULT 'website',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Index for webhook lookups
CREATE INDEX idx_roi_calculations_id ON roi_calculations(id);
CREATE INDEX idx_roi_calculations_email ON roi_calculations(email);
CREATE INDEX idx_roi_calculations_created_at ON roi_calculations(created_at DESC);

-- RLS policies
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (public form submissions)
CREATE POLICY "Allow public inserts" ON roi_calculations
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow service role full access (for webhooks)
CREATE POLICY "Service role full access" ON roi_calculations
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
