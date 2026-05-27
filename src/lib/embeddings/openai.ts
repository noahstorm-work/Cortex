export const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"
export const OPENAI_EMBEDDING_DIMENSIONS = 1536

export function getOpenAIKey(): string | null {
  return process.env.OPENAI_API_KEY || null
}

export async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  const key = getOpenAIKey()
  if (!key) throw new Error("OPENAI_API_KEY not configured")

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI embedding error (${res.status}): ${body}`)
  }

  const json = await res.json()
  return json.data[0].embedding as number[]
}

export async function generateOpenAIEmbeddings(texts: string[]): Promise<number[][]> {
  const key = getOpenAIKey()
  if (!key) throw new Error("OPENAI_API_KEY not configured")

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: texts,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI batch embedding error (${res.status}): ${body}`)
  }

  const json = await res.json()
  return json.data.sort((a: any, b: any) => a.index - b.index).map((d: any) => d.embedding as number[])
}
