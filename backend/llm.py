import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"


def generate_flashcards(text: str) -> list[dict]:
    """
    Generate 15-20 high-quality flashcards from the provided text.
    Returns a list of dicts: [{"question": str, "answer": str}, ...]
    """
    prompt = f"""You are an expert teacher and curriculum designer.

Analyze the following content and generate 15-20 high quality flashcards.

Rules:
- Cover ALL key concepts, definitions, formulas, relationships, and edge cases
- Include worked examples where relevant
- Make questions specific, not vague
- Answers should be concise but complete (1-3 sentences max)
- Vary question types: definitions, "why does X happen", "how does X work",
  comparisons between concepts, step-by-step examples, edge cases,
  and "what happens if" scenarios
- For STEM content: include formula cards and worked numeric examples
- For humanities/history: include cause-effect, significance, and comparison cards
- Do NOT generate duplicate or near-duplicate questions

Format strictly — repeat this exact pattern for every card, nothing else:
Question: <the question>
Answer: <the answer>

Content:
{text}
"""

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    return _parse_cards(response.choices[0].message.content)


def _parse_cards(raw: str) -> list[dict]:
    """Parse the Q&A formatted response into a list of card dicts."""
    cards = []
    lines = raw.strip().splitlines()

    current_q = None
    current_a_lines: list[str] = []

    for line in lines:
        stripped = line.strip()
        if stripped.lower().startswith("question:"):
            if current_q and current_a_lines:
                cards.append({
                    "question": current_q,
                    "answer":   " ".join(current_a_lines).strip(),
                })
            current_q = stripped[len("question:"):].strip()
            current_a_lines = []
        elif stripped.lower().startswith("answer:"):
            current_a_lines = [stripped[len("answer:"):].strip()]
        elif current_a_lines and stripped:
            current_a_lines.append(stripped)

    if current_q and current_a_lines:
        cards.append({
            "question": current_q,
            "answer":   " ".join(current_a_lines).strip(),
        })

    return cards