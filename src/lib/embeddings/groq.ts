const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_EMBEDDING_MODEL = "nomic-embed-text-v1.5";

export function getGroqKey(): string | null {
  return process.env.GROQ_API_KEY || null;
}

export async function generateGroqEmbedding(text: string): Promise<number[]> {
  const key = getGroqKey();
  if (!key) throw new Error("GROQ_API_KEY not configured");

  const res = await fetch(`${GROQ_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq embedding failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return json.data[0].embedding as number[];
}

export async function generateGroqEmbeddings(texts: string[]): Promise<number[][]> {
  const key = getGroqKey();
  if (!key) throw new Error("GROQ_API_KEY not configured");

  const res = await fetch(`${GROQ_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq batch embedding failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return json.data
    .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
    .map((item: { embedding: number[] }) => item.embedding);
}
