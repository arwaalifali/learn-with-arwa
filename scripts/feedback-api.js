const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isFeedbackCloudEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function supabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function mapFromDb(row) {
  return {
    id: row.id,
    submittedAt: row.submitted_at,
    name: row.name || "",
    foundVia: row.found_via || "",
    rating: Number(row.rating),
    likes: row.likes || "",
    improve: row.improve || "",
    recommend: row.recommend || "yes",
    comments: row.comments || "",
  };
}

function mapToDb(entry) {
  return {
    submitted_at: entry.submittedAt,
    name: entry.name,
    found_via: entry.foundVia,
    rating: entry.rating,
    likes: entry.likes,
    improve: entry.improve,
    recommend: entry.recommend,
    comments: entry.comments,
  };
}

export async function fetchPublicFeedback() {
  if (!isFeedbackCloudEnabled()) return null;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/feedback?select=*&order=submitted_at.desc`,
    { headers: supabaseHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to load public feedback.");
  }

  const rows = await response.json();
  return rows.map(mapFromDb);
}

export async function savePublicFeedback(entry) {
  if (!isFeedbackCloudEnabled()) return false;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      Prefer: "return=minimal",
    },
    body: JSON.stringify(mapToDb(entry)),
  });

  return response.ok;
}
