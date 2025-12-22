-- ============================================
-- CORRECTED: Delete old data and insert for 2025
-- ============================================

-- Delete old test data
DELETE FROM cta_clicks WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';
DELETE FROM page_views WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';
DELETE FROM posts WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';

-- Insert Posts with correct authors (Tiago/Vicente, not full names) and 2025 dates
INSERT INTO posts (slug, title, description, content, author, reading_time, tags, draft, published_at, meta_title, focus_keyword, charts)
VALUES
('tiago-ai-automation-2024', 'How AI is Transforming Business Automation in 2024', 'Discover the latest AI trends revolutionizing workflow automation', 'Lorem ipsum dolor sit amet...', 'Tiago', 8, ARRAY['AI', 'Automation', 'Productivity'], false, '2025-11-28'::date, 'AI Business Automation 2024', 'ai automation', '[]'::jsonb),
('tiago-workflow-optimization', 'The Ultimate Guide to Workflow Optimization', 'Learn proven strategies to streamline your business processes', 'Lorem ipsum dolor sit amet...', 'Tiago', 12, ARRAY['Workflow', 'Productivity', 'Efficiency'], false, '2025-12-01'::date, 'Workflow Optimization Guide', 'workflow optimization', '[]'::jsonb),
('tiago-no-code-automation', 'No-Code Automation Tools Every Business Needs', 'Explore the best no-code platforms for automation', 'Lorem ipsum dolor sit amet...', 'Tiago', 10, ARRAY['No-Code', 'Automation', 'Tools'], false, '2025-12-05'::date, 'No-Code Automation Tools', 'no-code automation', '[]'::jsonb),
('tiago-crm-integration', 'Mastering CRM Integration for Sales Teams', 'Complete guide to connecting your CRM with automation tools', 'Lorem ipsum dolor sit amet...', 'Tiago', 15, ARRAY['CRM', 'Sales', 'Integration'], false, '2025-12-11'::date, 'CRM Integration Guide', 'crm integration', '[]'::jsonb),
('tiago-roi-automation', 'Calculating ROI on Business Automation Projects', 'Data-driven approach to measuring automation success', 'Lorem ipsum dolor sit amet...', 'Tiago', 9, ARRAY['ROI', 'Analytics', 'Strategy'], false, '2025-12-17'::date, 'Automation ROI Calculator', 'automation roi', '[]'::jsonb),
('vicente-api-automation', 'Building Scalable API Automation Workflows', 'Technical deep-dive into API-first automation', 'Lorem ipsum dolor sit amet...', 'Vicente', 14, ARRAY['API', 'Development', 'Automation'], false, '2025-11-29'::date, 'API Automation Workflows', 'api automation', '[]'::jsonb),
('vicente-zapier-alternatives', 'Top Zapier Alternatives for Enterprise Automation', 'Compare the best enterprise automation platforms', 'Lorem ipsum dolor sit amet...', 'Vicente', 11, ARRAY['Tools', 'Comparison', 'Enterprise'], false, '2025-12-03'::date, 'Zapier Alternatives 2024', 'automation platforms', '[]'::jsonb),
('vicente-data-pipeline', 'Automating Your Data Pipeline: Best Practices', 'How to build reliable automated data workflows', 'Lorem ipsum dolor sit amet...', 'Vicente', 13, ARRAY['Data', 'Pipeline', 'ETL'], false, '2025-12-08'::date, 'Data Pipeline Automation', 'data pipeline', '[]'::jsonb),
('vicente-security-automation', 'Security Best Practices in Business Automation', 'Protect your automated workflows from vulnerabilities', 'Lorem ipsum dolor sit amet...', 'Vicente', 10, ARRAY['Security', 'Best Practices', 'DevOps'], false, '2025-12-14'::date, 'Automation Security Guide', 'automation security', '[]'::jsonb),
('vicente-scaling-automation', 'Scaling Automation: From 10 to 10,000 Workflows', 'Architecture patterns for enterprise-scale automation', 'Lorem ipsum dolor sit amet...', 'Vicente', 16, ARRAY['Architecture', 'Scaling', 'Enterprise'], false, '2025-12-19'::date, 'Scaling Automation Systems', 'scaling automation', '[]'::jsonb);

-- Generate Page Views (Nov 25 - Dec 22, 2025) with upward trend
DO $$
DECLARE
    tiago_slugs text[] := ARRAY['tiago-ai-automation-2024', 'tiago-workflow-optimization', 'tiago-no-code-automation', 'tiago-crm-integration', 'tiago-roi-automation'];
    vicente_slugs text[] := ARRAY['vicente-api-automation', 'vicente-zapier-alternatives', 'vicente-data-pipeline', 'vicente-security-automation', 'vicente-scaling-automation'];
    slug_item text;
    day_num integer;
    target_date date;
    base_views integer;
    views_per_slug integer;
    i integer;
    start_date date := '2025-11-25'::date;  -- FIXED: 2025 not 2024
BEGIN
    FOR day_num IN 0..27 LOOP
        target_date := start_date + day_num;
        
        -- Upward trend: day 0 = ~1500/slug, day 27 = ~4500/slug
        base_views := 1500 + (day_num * 110);
        
        -- Tiago's posts (5 posts)
        FOREACH slug_item IN ARRAY tiago_slugs LOOP
            views_per_slug := (base_views * (0.9 + random() * 0.2))::integer;
            FOR i IN 1..views_per_slug LOOP
                INSERT INTO page_views (visitor_id, slug, referrer, created_at)
                VALUES (
                    'v_' || floor(random() * 999999999)::text,
                    slug_item,
                    CASE 
                        WHEN random() < 0.35 THEN 'https://google.com'
                        WHEN random() < 0.5 THEN 'https://linkedin.com'
                        ELSE null 
                    END,
                    target_date::timestamp + (random() * INTERVAL '23 hours')
                );
            END LOOP;
        END LOOP;
        
        -- Vicente's posts (5 posts)
        FOREACH slug_item IN ARRAY vicente_slugs LOOP
            views_per_slug := (base_views * (0.9 + random() * 0.2))::integer;
            FOR i IN 1..views_per_slug LOOP
                INSERT INTO page_views (visitor_id, slug, referrer, created_at)
                VALUES (
                    'v_' || floor(random() * 999999999)::text,
                    slug_item,
                    CASE 
                        WHEN random() < 0.35 THEN 'https://google.com'
                        WHEN random() < 0.5 THEN 'https://linkedin.com'
                        ELSE null 
                    END,
                    target_date::timestamp + (random() * INTERVAL '23 hours')
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Generate CTA Clicks (~10% of views)
DO $$
DECLARE
    all_slugs text[] := ARRAY['tiago-ai-automation-2024', 'tiago-workflow-optimization', 'tiago-no-code-automation', 'tiago-crm-integration', 'tiago-roi-automation', 'vicente-api-automation', 'vicente-zapier-alternatives', 'vicente-data-pipeline', 'vicente-security-automation', 'vicente-scaling-automation'];
    slug_item text;
    day_num integer;
    target_date date;
    base_clicks integer;
    clicks_per_slug integer;
    i integer;
    start_date date := '2025-11-25'::date;  -- FIXED: 2025 not 2024
BEGIN
    FOR day_num IN 0..27 LOOP
        target_date := start_date + day_num;
        
        -- ~10% of views: day 0 = ~150/slug, day 27 = ~450/slug
        base_clicks := 150 + (day_num * 11);
        
        FOREACH slug_item IN ARRAY all_slugs LOOP
            clicks_per_slug := (base_clicks * (0.9 + random() * 0.2))::integer;
            FOR i IN 1..clicks_per_slug LOOP
                INSERT INTO cta_clicks (visitor_id, slug, created_at)
                VALUES (
                    'c_' || floor(random() * 999999999)::text,
                    slug_item,
                    target_date::timestamp + (random() * INTERVAL '23 hours')
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Verify counts
SELECT 'page_views' as table_name, COUNT(*) as count FROM page_views WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%'
UNION ALL
SELECT 'cta_clicks', COUNT(*) FROM cta_clicks WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%'
UNION ALL
SELECT 'posts', COUNT(*) FROM posts WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';
