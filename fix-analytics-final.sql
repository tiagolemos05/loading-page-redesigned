-- ============================================
-- FINAL FIX: Correct year (2025) + correct authors
-- Target: ~70k views, ~7k clicks, upward trend
-- ============================================

-- Clean slate
DELETE FROM cta_clicks WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';
DELETE FROM page_views WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';
DELETE FROM posts WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';

-- Insert Posts with CORRECT authors (Tiago/Vicente only)
INSERT INTO posts (slug, title, description, content, author, reading_time, tags, draft, published_at, meta_title, focus_keyword, charts)
VALUES
('tiago-ai-automation-2024', 'How AI is Transforming Business Automation in 2024', 'Discover the latest AI trends revolutionizing workflow automation', 'Lorem ipsum...', 'Tiago', 8, ARRAY['AI', 'Automation'], false, '2025-11-25', 'AI Business Automation', 'ai automation', '[]'::jsonb),
('tiago-workflow-optimization', 'The Ultimate Guide to Workflow Optimization', 'Learn proven strategies to streamline your business processes', 'Lorem ipsum...', 'Tiago', 12, ARRAY['Workflow', 'Productivity'], false, '2025-11-27', 'Workflow Optimization', 'workflow', '[]'::jsonb),
('tiago-no-code-automation', 'No-Code Automation Tools Every Business Needs', 'Explore the best no-code platforms for automation', 'Lorem ipsum...', 'Tiago', 10, ARRAY['No-Code', 'Tools'], false, '2025-12-01', 'No-Code Tools', 'no-code', '[]'::jsonb),
('tiago-crm-integration', 'Mastering CRM Integration for Sales Teams', 'Complete guide to connecting your CRM with automation tools', 'Lorem ipsum...', 'Tiago', 15, ARRAY['CRM', 'Sales'], false, '2025-12-08', 'CRM Integration', 'crm', '[]'::jsonb),
('tiago-roi-automation', 'Calculating ROI on Business Automation Projects', 'Data-driven approach to measuring automation success', 'Lorem ipsum...', 'Tiago', 9, ARRAY['ROI', 'Analytics'], false, '2025-12-15', 'Automation ROI', 'roi', '[]'::jsonb),
('vicente-api-automation', 'Building Scalable API Automation Workflows', 'Technical deep-dive into API-first automation', 'Lorem ipsum...', 'Vicente', 14, ARRAY['API', 'Development'], false, '2025-11-26', 'API Automation', 'api', '[]'::jsonb),
('vicente-zapier-alternatives', 'Top Zapier Alternatives for Enterprise Automation', 'Compare the best enterprise automation platforms', 'Lorem ipsum...', 'Vicente', 11, ARRAY['Tools', 'Enterprise'], false, '2025-11-30', 'Zapier Alternatives', 'zapier', '[]'::jsonb),
('vicente-data-pipeline', 'Automating Your Data Pipeline: Best Practices', 'How to build reliable automated data workflows', 'Lorem ipsum...', 'Vicente', 13, ARRAY['Data', 'Pipeline'], false, '2025-12-05', 'Data Pipeline', 'data', '[]'::jsonb),
('vicente-security-automation', 'Security Best Practices in Business Automation', 'Protect your automated workflows from vulnerabilities', 'Lorem ipsum...', 'Vicente', 10, ARRAY['Security', 'DevOps'], false, '2025-12-12', 'Security Automation', 'security', '[]'::jsonb),
('vicente-scaling-automation', 'Scaling Automation: From 10 to 10,000 Workflows', 'Architecture patterns for enterprise-scale automation', 'Lorem ipsum...', 'Vicente', 16, ARRAY['Architecture', 'Scaling'], false, '2025-12-18', 'Scaling Automation', 'scaling', '[]'::jsonb);

-- Generate Page Views: Nov 25 - Dec 22, 2025 (28 days)
-- ~70k total = ~250/slug/day average, trending up from ~180 to ~320
DO $$
DECLARE
    tiago_slugs text[] := ARRAY['tiago-ai-automation-2024', 'tiago-workflow-optimization', 'tiago-no-code-automation', 'tiago-crm-integration', 'tiago-roi-automation'];
    vicente_slugs text[] := ARRAY['vicente-api-automation', 'vicente-zapier-alternatives', 'vicente-data-pipeline', 'vicente-security-automation', 'vicente-scaling-automation'];
    slug_item text;
    day_num integer;
    target_date date;
    base_views integer;
    views_count integer;
    i integer;
    start_date date := '2025-11-25'::date;
BEGIN
    FOR day_num IN 0..27 LOOP
        target_date := start_date + day_num;
        
        -- Upward trend: 180 -> 320 per slug per day
        base_views := 180 + (day_num * 5);
        
        -- Tiago's posts
        FOREACH slug_item IN ARRAY tiago_slugs LOOP
            views_count := (base_views * (0.85 + random() * 0.3))::integer;
            FOR i IN 1..views_count LOOP
                INSERT INTO page_views (visitor_id, slug, referrer, created_at)
                VALUES (
                    'v_' || floor(random() * 999999999)::text,
                    slug_item,
                    CASE 
                        WHEN random() < 0.4 THEN 'https://google.com'
                        WHEN random() < 0.55 THEN 'https://linkedin.com'
                        WHEN random() < 0.65 THEN 'https://twitter.com'
                        ELSE null 
                    END,
                    target_date::timestamp + (random() * INTERVAL '23 hours')
                );
            END LOOP;
        END LOOP;
        
        -- Vicente's posts
        FOREACH slug_item IN ARRAY vicente_slugs LOOP
            views_count := (base_views * (0.85 + random() * 0.3))::integer;
            FOR i IN 1..views_count LOOP
                INSERT INTO page_views (visitor_id, slug, referrer, created_at)
                VALUES (
                    'v_' || floor(random() * 999999999)::text,
                    slug_item,
                    CASE 
                        WHEN random() < 0.4 THEN 'https://google.com'
                        WHEN random() < 0.55 THEN 'https://linkedin.com'
                        WHEN random() < 0.65 THEN 'https://twitter.com'
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
    clicks_count integer;
    i integer;
    start_date date := '2025-11-25'::date;
BEGIN
    FOR day_num IN 0..27 LOOP
        target_date := start_date + day_num;
        
        -- ~10% of views: 18 -> 32 per slug per day
        base_clicks := 18 + (day_num * 0.5)::integer;
        
        FOREACH slug_item IN ARRAY all_slugs LOOP
            clicks_count := (base_clicks * (0.85 + random() * 0.3))::integer;
            FOR i IN 1..clicks_count LOOP
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

-- Verify
SELECT 'page_views' as tbl, COUNT(*) as cnt FROM page_views WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%'
UNION ALL
SELECT 'cta_clicks', COUNT(*) FROM cta_clicks WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%'
UNION ALL
SELECT 'posts', COUNT(*) FROM posts WHERE slug LIKE 'tiago-%' OR slug LIKE 'vicente-%';
