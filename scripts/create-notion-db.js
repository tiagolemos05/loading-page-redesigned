const NOTION_API_KEY = process.env.NOTION_API_KEY;
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID;

if (!NOTION_API_KEY || !PARENT_PAGE_ID) {
  console.error("Missing env vars. Run with:");
  console.error("NOTION_API_KEY=xxx NOTION_PARENT_PAGE_ID=xxx node create-notion-db.js");
  process.exit(1);
}

async function createDatabase() {
  const response = await fetch("https://api.notion.com/v1/databases", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { type: "page_id", page_id: PARENT_PAGE_ID },
      title: [{ type: "text", text: { content: "Blog Content Pipeline" } }],
      properties: {
        Title: { title: {} },
        Status: {
          select: {
            options: [
              { name: "Idea", color: "gray" },
              { name: "Researching", color: "yellow" },
              { name: "Writing", color: "orange" },
              { name: "SEO Review", color: "blue" },
              { name: "Ready", color: "green" },
              { name: "Published", color: "purple" },
            ],
          },
        },
        Urgency: {
          select: {
            options: [
              { name: "Time-sensitive", color: "red" },
              { name: "Evergreen", color: "green" },
            ],
          },
        },
        "Source URL": { url: {} },
        "Idea Rationale": { rich_text: {} },
        "Target Keywords": { rich_text: {} },
        "Focus Keyword": { rich_text: {} },
        Content: { rich_text: {} },
        Description: { rich_text: {} },
        "Meta Title": { rich_text: {} },
        Slug: { rich_text: {} },
        Tags: {
          multi_select: {
            options: [
              { name: "AI", color: "blue" },
              { name: "Automation", color: "green" },
              { name: "Business", color: "orange" },
              { name: "Tutorial", color: "purple" },
              { name: "News", color: "red" },
            ],
          },
        },
        "Published URL": { url: {} },
        Created: { created_time: {} },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Error creating database:", data);
    process.exit(1);
  }

  console.log("Database created successfully!");
  console.log("Database ID:", data.id);
  console.log("URL:", data.url);
}

createDatabase();
