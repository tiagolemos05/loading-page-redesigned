-- ============================================
-- DELETE OLD DATA AND INSERT CORRECTED DATA
-- ============================================

-- Delete old test data
DELETE FROM cta_clicks WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';
DELETE FROM page_views WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';
DELETE FROM posts WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';

-- Insert Posts
INSERT INTO posts (slug, title, description, content, author, reading_time, tags, draft, published_at, meta_title, focus_keyword, charts)
VALUES
('tiago-ai-automation-2024', 'How AI is Transforming Business Automation in 2024', 'Discover the latest AI trends revolutionizing workflow automation', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Tiago Lemos', 8, ARRAY['AI', 'Automation', 'Productivity'], false, '2024-11-28'::date, 'AI Business Automation 2024', 'ai automation', '[]'::jsonb),
('tiago-workflow-optimization', 'The Ultimate Guide to Workflow Optimization', 'Learn proven strategies to streamline your business processes', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Tiago Lemos', 12, ARRAY['Workflow', 'Productivity', 'Efficiency'], false, '2024-12-01'::date, 'Workflow Optimization Guide', 'workflow optimization', '[]'::jsonb),
('tiago-no-code-automation', 'No-Code Automation Tools Every Business Needs', 'Explore the best no-code platforms for automation', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Tiago Lemos', 10, ARRAY['No-Code', 'Automation', 'Tools'], false, '2024-12-05'::date, 'No-Code Automation Tools', 'no-code automation', '[]'::jsonb),
('tiago-crm-integration', 'Mastering CRM Integration for Sales Teams', 'Complete guide to connecting your CRM with automation tools', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Tiago Lemos', 15, ARRAY['CRM', 'Sales', 'Integration'], false, '2024-12-11'::date, 'CRM Integration Guide', 'crm integration', '[]'::jsonb),
('tiago-roi-automation', 'Calculating ROI on Business Automation Projects', 'Data-driven approach to measuring automation success', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Tiago Lemos', 9, ARRAY['ROI', 'Analytics', 'Strategy'], false, '2024-12-17'::date, 'Automation ROI Calculator', 'automation roi', '[]'::jsonb),
('vicente-api-automation', 'Building Scalable API Automation Workflows', 'Technical deep-dive into API-first automation', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Vicente Silva', 14, ARRAY['API', 'Development', 'Automation'], false, '2024-11-29'::date, 'API Automation Workflows', 'api automation', '[]'::jsonb),
('vicente-zapier-alternatives', 'Top Zapier Alternatives for Enterprise Automation', 'Compare the best enterprise automation platforms', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Vicente Silva', 11, ARRAY['Tools', 'Comparison', 'Enterprise'], false, '2024-12-03'::date, 'Zapier Alternatives 2024', 'automation platforms', '[]'::jsonb),
('vicente-data-pipeline', 'Automating Your Data Pipeline: Best Practices', 'How to build reliable automated data workflows', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Vicente Silva', 13, ARRAY['Data', 'Pipeline', 'ETL'], false, '2024-12-08'::date, 'Data Pipeline Automation', 'data pipeline', '[]'::jsonb),
('vicente-security-automation', 'Security Best Practices in Business Automation', 'Protect your automated workflows from vulnerabilities', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Vicente Silva', 10, ARRAY['Security', 'Best Practices', 'DevOps'], false, '2024-12-14'::date, 'Automation Security Guide', 'automation security', '[]'::jsonb),
('vicente-scaling-automation', 'Scaling Automation: From 10 to 10,000 Workflows', 'Architecture patterns for enterprise-scale automation', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Vicente Silva', 16, ARRAY['Architecture', 'Scaling', 'Enterprise'], false, '2024-12-19'::date, 'Scaling Automation Systems', 'scaling automation', '[]'::jsonb);

-- Generate Page Views - EXPLICIT DATES (Nov 25 - Dec 22, 2024)
DO $$
DECLARE
    tiago_slugs text[] := ARRAY['tiago-ai-automation-2024', 'tiago-workflow-optimization', 'tiago-no-code-automation', 'tiago-crm-integration', 'tiago-roi-automation'];
    vicente_slugs text[] := ARRAY['vicente-api-automation', 'vicente-zapier-alternatives', 'vicente-data-pipeline', 'vicente-security-automation', 'vicente-scaling-automation'];
    slug_item text;
    day_num integer;
    target_date date;
    tiago_daily integer;
    vicente_daily integer;
    growth float;
    views_per_slug integer;
    i integer;
    start_date date := '2024-11-25'::date;
BEGIN
    -- Loop through 28 days: Nov 25 - Dec 22
    FOR day_num IN 0..27 LOOP
        target_date := start_date + day_num;
        
        -- Growth from 1.0x to 3.8x over 28 days
        growth := 1.0 + (day_num::float / 27.0) * 2.8;
        
        -- Daily views with upward trend
        tiago_daily := (35000 * growth * (0.92 + random() * 0.16))::integer;
        vicente_daily := (26000 * growth * (0.92 + random() * 0.16))::integer;
        
        -- Small dips early on for realism
        IF day_num < 10 AND random() < 0.18 THEN
            tiago_daily := (tiago_daily * 0.87)::integer;
            vicente_daily := (vicente_daily * 0.87)::integer;
        END IF;
        
        -- Tiago's posts
        FOREACH slug_item IN ARRAY tiago_slugs LOOP
            views_per_slug := (tiago_daily / 5.0 * (0.85 + random() * 0.3))::integer;
            FOR i IN 1..LEAST(views_per_slug, 1200) LOOP
                INSERT INTO page_views (visitor_id, slug, referrer, created_at)
                VALUES (
                    'v_' || floor(random() * 999999999)::text,
                    slug_item,
                    CASE WHEN random() < 0.35 THEN 'https://google.com' ELSE null END,
                    target_date::timestamp + (random() * INTERVAL '22 hours')
                );
            END LOOP;
        END LOOP;
        
        -- Vicente's posts
        FOREACH slug_item IN ARRAY vicente_slugs LOOP
            views_per_slug := (vicente_daily / 5.0 * (0.85 + random() * 0.3))::integer;
            FOR i IN 1..LEAST(views_per_slug, 1200) LOOP
                INSERT INTO page_views (visitor_id, slug, referrer, created_at)
                VALUES (
                    'v_' || floor(random() * 999999999)::text,
                    slug_item,
                    CASE WHEN random() < 0.35 THEN 'https://google.com' ELSE null END,
                    target_date::timestamp + (random() * INTERVAL '22 hours')
                );
            END LOOP;
        END LOOP;
        
        -- Log progress
        IF day_num % 7 = 0 THEN
            RAISE NOTICE 'Processed day % (%), Tiago: %, Vicente: %', day_num, target_date, tiago_daily, vicente_daily;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Completed! Data from % to %', start_date, start_date + 27;
END $$;

-- Generate CTA Clicks
DO $$
DECLARE
    all_slugs text[] := ARRAY['tiago-ai-automation-2024', 'tiago-workflow-optimization', 'tiago-no-code-automation', 'tiago-crm-integration', 'tiago-roi-automation', 'vicente-api-automation', 'vicente-zapier-alternatives', 'vicente-data-pipeline', 'vicente-security-automation', 'vicente-scaling-automation'];
    slug_item text;
    day_num integer;
    target_date date;
    daily_clicks integer;
    growth float;
    clicks_per_slug integer;
    i integer;
    start_date date := '2024-11-25'::date;
BEGIN
    FOR day_num IN 0..27 LOOP
        target_date := start_date + day_num;
        growth := 1.0 + (day_num::float / 27.0) * 2.8;
        daily_clicks := (5500 * growth * (0.92 + random() * 0.16))::integer;
        
        FOREACH slug_item IN ARRAY all_slugs LOOP
            clicks_per_slug := (daily_clicks / 10.0 * (0.85 + random() * 0.3))::integer;
            FOR i IN 1..LEAST(clicks_per_slug, 150) LOOP
                INSERT INTO cta_clicks (visitor_id, slug, created_at)
                VALUES (
                    'c_' || floor(random() * 999999999)::text,
                    slug_item,
                    target_date::timestamp + (random() * INTERVAL '22 hours')
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
