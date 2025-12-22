-- ============================================
-- DELETE TEST DATA AFTER PHOTO SHOOT
-- ============================================

DELETE FROM cta_clicks 
WHERE slug IN (
    'tiago-ai-automation-2024', 'tiago-workflow-optimization', 'tiago-no-code-automation',
    'tiago-crm-integration', 'tiago-roi-automation',
    'vicente-api-automation', 'vicente-zapier-alternatives', 'vicente-data-pipeline',
    'vicente-security-automation', 'vicente-scaling-automation'
);

DELETE FROM page_views 
WHERE slug IN (
    'tiago-ai-automation-2024', 'tiago-workflow-optimization', 'tiago-no-code-automation',
    'tiago-crm-integration', 'tiago-roi-automation',
    'vicente-api-automation', 'vicente-zapier-alternatives', 'vicente-data-pipeline',
    'vicente-security-automation', 'vicente-scaling-automation'
);

DELETE FROM posts 
WHERE slug IN (
    'tiago-ai-automation-2024', 'tiago-workflow-optimization', 'tiago-no-code-automation',
    'tiago-crm-integration', 'tiago-roi-automation',
    'vicente-api-automation', 'vicente-zapier-alternatives', 'vicente-data-pipeline',
    'vicente-security-automation', 'vicente-scaling-automation'
);
