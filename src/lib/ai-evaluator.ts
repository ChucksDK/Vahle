import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIEvaluationResult {
  relevanceScore: number;
  keyReasons: string;
  suggestedActions?: string;
  categories: string;
  priority: string;
  summary?: string;
  scoreBreakdown?: string;
}

const VAHLE_CONTEXT = `
Vahle A/S is a Danish manufacturer of bespoke, high-quality wooden doors, designed and produced entirely in-house in Mørke, Djursland. Since 1976, the company has specialized in crafting architecturally integrated doors that combine craftsmanship, functionality, and design. Their products serve both classic and modern architectural styles, with optional fire, sound, and security ratings. Vahle is committed to sustainability, using FSC-certified wood, 100% green electricity, and offering full Environmental Product Declarations.

Primary Customers:
- Architects and architectural firms specifying custom elements
- Construction companies and contractors delivering premium or heritage-focused builds
- Real estate developers in commercial and luxury residential sectors
- Interior design studios working on upscale interiors
- Institutional builders for cultural, public, or educational facilities
- Luxury residential builders creating or renovating high-end homes

Target Sectors:
- Luxury hotels and resorts
- Cultural institutions (museums, galleries, theaters)
- Corporate offices and headquarters
- Historic and heritage buildings
- Upscale real estate developments
- Sustainable/green building projects
- High-end residential projects

Key Indicators to Look For:
1. Customer Type Mentions (0-30 points):
   - Architects, interior designers, contractors, developers, builders
   - Institutions involved in significant building projects

2. Project Types (0-25 points):
   - Heritage restorations, new high-profile builds, expansions, retrofits
   - Sustainable/high-performance construction projects

3. Target Sectors (0-25 points):
   - Luxury hospitality, cultural venues, prestigious corporate spaces
   - Listed buildings, upscale residential developments

4. Relevant Keywords (0-20 points):
   - "custom architecture," "bespoke interior design," "heritage restoration"
   - "listed building renovation," "green building project," "sustainability-led retrofit"
   - "mass timber construction," "luxury hotel development," "boutique hotel renovation"
   - "premium materials," "architect-designed features"

Categories to tag:
- Heritage Restoration
- Luxury Development
- Cultural Institution
- Sustainable Building
- Custom Architecture
- High-End Residential
- Hotel Development
- Corporate HQ
- Listed Building
- Green Construction
`;

export async function evaluateArticle(
  title: string,
  content?: string | null,
  description?: string | null
): Promise<AIEvaluationResult> {
  try {
    // If we have no content at all, provide a basic evaluation based on title only
    if (!title || title.trim() === '') {
      return {
        relevanceScore: 0,
        keyReasons: JSON.stringify(['No title or content available']),
        categories: JSON.stringify([]),
        priority: 'LOW',
      };
    }

    const articleText = `
Title: ${title}
Description: ${description || 'N/A'}
Content: ${content ? content.substring(0, 3000) : 'N/A'}
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a sales intelligence analyst for Vahle A/S, a Danish manufacturer of bespoke wooden doors. Evaluate articles for sales relevance based on the following context:\n\n${VAHLE_CONTEXT}\n\nProvide your evaluation in JSON format.`,
        },
        {
          role: 'user',
          content: `Evaluate this article for sales relevance to Vahle A/S (custom wooden doors):\n\n${articleText}\n\nNote: If content/description is N/A, evaluate based on the title only. Return a JSON object with:
- relevanceScore (0-100)
- keyReasons (array of 2-4 bullet points explaining the relevance)
- suggestedActions (specific sales actions if score > 60, otherwise null)
- categories (array of relevant category tags)
- priority ("HIGH" if score > 80, "MEDIUM" if score > 60, "LOW" otherwise)
- summary (1-2 sentence summary of why this matters to Vahle, or null if not relevant)
- scoreBreakdown (object with detailed scores: {"customerTypeMentions": 0-30, "projectTypes": 0-25, "targetSectors": 0-25, "relevantKeywords": 0-20, "explanation": "brief explanation of each score"})`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      relevanceScore: Math.min(100, Math.max(0, result.relevanceScore || 0)),
      keyReasons: JSON.stringify(result.keyReasons || []),
      suggestedActions: Array.isArray(result.suggestedActions) 
        ? result.suggestedActions.join('\n') 
        : result.suggestedActions || null,
      categories: JSON.stringify(result.categories || []),
      priority: result.priority || 'LOW',
      summary: result.summary,
      scoreBreakdown: JSON.stringify(result.scoreBreakdown || {}),
    };
  } catch (error) {
    console.error('Error evaluating article with AI:', error);
    
    return {
      relevanceScore: 0,
      keyReasons: JSON.stringify(['Error evaluating article']),
      categories: JSON.stringify([]),
      priority: 'LOW',
    };
  }
}