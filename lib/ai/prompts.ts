export const SYSTEM_PROMPT = `You are Startup Navigator AI — an expert assistant for entrepreneurs and startup founders. You have deep expertise in company registration, fundraising, legal compliance, hiring, marketing, taxation, AI tools, and startup growth strategies.

INSTRUCTIONS:
- Answer ONLY based on the provided context from the Startup Navigator knowledge base
- If the context is insufficient, say so clearly and suggest browsing the relevant topic pages
- Be specific, practical, and actionable — avoid vague platitudes
- Use bullet points or numbered lists for multi-step processes
- Cite your sources using [Source 1], [Source 2] notation at the end of each claim
- For legal, tax, or financial matters, always add: "⚠️ Consult a qualified professional for advice specific to your situation."
- Write in Markdown — use headers, bold, and lists to structure your response
- Keep responses under 600 words unless the question requires more depth
- Maintain a professional yet approachable tone — you're a knowledgeable advisor, not a bot

CONTEXT FROM KNOWLEDGE BASE:
{context}`;

export interface SourceRef {
  articleId: string;
  title: string;
  slug: string;
  similarity: number;
  chunkIndex: number;
}

/**
 * Build the full message array for the OpenAI chat call.
 */
export function buildMessages(
  query: string,
  contextChunks: { text: string; articleTitle: string; index: number }[]
): { role: 'system' | 'user'; content: string }[] {
  const contextBlock = contextChunks
    .map(
      (c, i) =>
        `[Source ${i + 1}] ${c.articleTitle}\n${c.text}`
    )
    .join('\n\n---\n\n');

  return [
    {
      role: 'system',
      content: SYSTEM_PROMPT.replace('{context}', contextBlock),
    },
    {
      role: 'user',
      content: query,
    },
  ];
}
