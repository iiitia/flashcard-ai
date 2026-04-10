from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf_utils import extract_text_from_pdf
from llm import generate_flashcards
from dotenv import load_dotenv
from google import genai
import os
import json
import time
import datetime
import traceback
import bcrypt
 
load_dotenv()
 
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
 
app = Flask(__name__)
CORS(app)
 
USERS_FILE = "users.json"
 
 
# ── User storage helpers ───────────────────────────────────────────────────────
def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        return json.load(f)
 
def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)
 
 
# ── Auth Routes ────────────────────────────────────────────────────────────────
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")
 
        # Basic validation
        if not username or not email or not password:
            return jsonify({"error": "All fields are required"}), 400
 
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
 
        users = load_users()
 
        # Check unique email
        if any(u["email"] == email for u in users):
            return jsonify({"error": "Email already registered"}), 409
 
        # Hash password
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
 
        new_user = {
            "id":         f"user_{int(time.time())}",
            "username":   username,
            "email":      email,
            "password":   hashed,
            "createdAt":  datetime.datetime.now().isoformat(),
        }
 
        users.append(new_user)
        save_users(users)
 
        print(f"✅ New user registered: {email}")
 
        return jsonify({
            "message": "Registration successful",
            "user": {
                "id":       new_user["id"],
                "username": new_user["username"],
                "email":    new_user["email"],
            }
        }), 201
 
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
 
 
@app.route("/login", methods=["POST"])
def login():
    try:
        data     = request.get_json()
        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")
 
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
 
        users = load_users()
        user  = next((u for u in users if u["email"] == email), None)
 
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
 
        # Check password
        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return jsonify({"error": "Invalid email or password"}), 401
 
        print(f"✅ User logged in: {email}")
 
        return jsonify({
            "message": "Login successful",
            "user": {
                "id":       user["id"],
                "username": user["username"],
                "email":    user["email"],
            }
        }), 200
 
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
 
 
# ── Home ───────────────────────────────────────────────────────────────────────
@app.route("/")
def home():
    return "Backend is running 🚀"
 
 
# ── Upload PDF ─────────────────────────────────────────────────────────────────
@app.route("/upload", methods=["POST"])
def upload():
    try:
        print("\n📥 REQUEST RECEIVED")
 
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
 
        file      = request.files["file"]
        deck_name = request.form.get("deckName", "")
 
        if file.filename == "":
            return jsonify({"error": "Empty file"}), 400
 
        print(f"📄 File: {file.filename}")
 
        text = extract_text_from_pdf(file)
 
        if not text.strip():
            return jsonify({"error": "No text extracted"}), 400
 
        print("📚 Extracted text:", text[:200])
 
        cards = generate_flashcards(text)
        cards = enrich_cards(cards)
 
        print("✅ Flashcards generated:", len(cards))
 
        return jsonify({
            "flashcards": cards,
            "deckName":   deck_name or file.filename.replace(".pdf", ""),
        })
 
    except Exception as e:
        print("🔥 ERROR:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
 
 
# ── Generate from pasted text ──────────────────────────────────────────────────
@app.route("/generate-from-text", methods=["POST"])
def generate_from_text():
    try:
        data      = request.get_json()
        text      = data.get("text", "").strip()
        deck_name = data.get("deckName", "")
 
        if not text:
            return jsonify({"error": "No text provided"}), 400
 
        print("📝 Generating from pasted text, length:", len(text))
 
        cards = generate_flashcards(text)
        cards = enrich_cards(cards)
 
        print("✅ Cards generated:", len(cards))
 
        return jsonify({
            "flashcards": cards,
            "deckName":   deck_name or "Pasted Content",
        })
 
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
 
 
# ── Explain a card ─────────────────────────────────────────────────────────────
@app.route("/explain", methods=["POST"])
def explain():
    try:
        data     = request.get_json()
        question = data.get("question")
        answer   = data.get("answer")
 
        if not question or not answer:
            return jsonify({"error": "Missing data"}), 400
 
        prompt = f"""
        You are a knowledgeable tutor. A student is learning about the following topic:
 
        Question: {question}
        Answer: {answer}
 
        Explain the answer clearly and directly in 2-3 short sentences.
        - Focus only on the actual topic or fact (history, science, definition, concept, etc.)
        - Give brief background or context that helps it make sense
        - Do NOT mention study techniques, flashcards, or active recall
        - Optionally end with one surprising or interesting fact about this topic
        - Write in plain, simple English as if explaining to a curious teenager
        """
 
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
 
        return jsonify({"explanation": response.text})
 
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
 
 
# ── Helpers ────────────────────────────────────────────────────────────────────
def enrich_cards(cards):
    """Add SM-2 spaced repetition fields to each card."""
    enriched = []
    for i, card in enumerate(cards):
        enriched.append({
            "id":          f"card_{i}_{int(time.time())}",
            "question":    card.get("question", ""),
            "answer":      card.get("answer", ""),
            "interval":    1,
            "easeFactor":  2.5,
            "repetitions": 0,
            "nextReview":  datetime.datetime.now().isoformat(),
            "status":      "new",
        })
    return enriched


if __name__ == "__main__":
    print("🚀 Starting server...")
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)