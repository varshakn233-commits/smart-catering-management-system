
import json
import re
from pathlib import Path

import mysql.connector
from dotenv import dotenv_values


# =====================================================
# DATABASE CONFIGURATION
# =====================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
env_path = PROJECT_ROOT / "backend" / ".env"

if not env_path.exists():
    env_path = PROJECT_ROOT / ".env"

config = dotenv_values(env_path)

required_keys = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME"
]

missing = [
    key for key in required_keys
    if config.get(key) is None
]

if missing:
    raise SystemExit(
        "Missing database settings: " + ", ".join(missing)
    )


# =====================================================
# TEXT SENTIMENT LEXICON
# =====================================================

POSITIVE_WORDS = {
    "excellent", "wonderful", "great", "good", "amazing",
    "delicious", "tasty", "friendly", "helpful", "timely",
    "satisfied", "satisfactory", "fresh", "perfect",
    "beautiful", "recommend", "love", "enjoyed", "quality",
    "professional", "polite", "fantastic", "impressive",
    "clean", "superb", "happy", "quick", "excellent"
}

NEGATIVE_WORDS = {
    "poor", "bad", "disappointing", "disappointed",
    "worst", "terrible", "awful", "late", "delay",
    "delayed", "rude", "unfriendly", "unprofessional",
    "improvement", "below", "expectations", "cold",
    "tasteless", "dirty", "waste", "slow", "issue",
    "issues", "problem", "problems", "overpriced",
    "unsatisfied", "unhappy", "inadequate", "missing"
}

NEGATIONS = {
    "not", "never", "no", "hardly", "isn't", "wasn't",
    "weren't", "didn't", "don't", "can't", "couldn't"
}


def analyze_text(review_text):
    """
    Lexicon-based sentiment analysis of written review text.
    This is a rule-based baseline, not a trained ML model.
    """

    review_lower = (review_text or "").lower()

    words = re.findall(
        r"[a-z]+(?:'[a-z]+)?",
        review_lower
    )

    positive_score = 0
    negative_score = 0

    for index, word in enumerate(words):
        if word not in POSITIVE_WORDS and word not in NEGATIVE_WORDS:
            continue

        # Check for a negation among the preceding three words.
        preceding_words = words[max(0, index - 3):index]
        negated = any(item in NEGATIONS for item in preceding_words)

        if word in POSITIVE_WORDS:
            if negated:
                negative_score += 1
            else:
                positive_score += 1

        elif word in NEGATIVE_WORDS:
            if negated:
                positive_score += 1
            else:
                negative_score += 1

    score = positive_score - negative_score

    # Treat clearly mixed or average reviews as Neutral.
    neutral_phrases = [
        "average experience",
        "mixed experience",
        "could be better",
        "room for improvement",
        "neither good nor bad"
    ]

    if any(phrase in review_lower for phrase in neutral_phrases):
        sentiment = "Neutral"
    elif score > 0:
        sentiment = "Positive"
    elif score < 0:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    return {
        "sentiment": sentiment,
        "positive_score": positive_score,
        "negative_score": negative_score,
        "score": score
    }



# =====================================================
# DATABASE ANALYSIS
# =====================================================

def main():
    connection = None

    try:
        connection = mysql.connector.connect(
            host=config["DB_HOST"],
            user=config["DB_USER"],
            password=config["DB_PASSWORD"],
            database=config["DB_NAME"],
            port=int(config.get("DB_PORT") or 3306),
            connection_timeout=10
        )

        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                r.review_id,
                r.customer_id,
                r.caterer_id,
                r.rating,
                r.review_text,
                r.created_at,
                c.full_name AS customer_name,
                ca.brand_name AS caterer_name
            FROM reviews r
            LEFT JOIN customers c
                ON r.customer_id = c.customer_id
            LEFT JOIN caterers ca
                ON r.caterer_id = ca.caterer_id
            ORDER BY r.created_at DESC, r.review_id DESC
        """)

        reviews = cursor.fetchall()

        results = []
        counts = {
            "Positive": 0,
            "Neutral": 0,
            "Negative": 0
        }

        empty_reviews = 0

        for review in reviews:
            text = (review.get("review_text") or "").strip()

            if not text:
                empty_reviews += 1
                continue

            analysis = analyze_text(text)
            sentiment = analysis["sentiment"]
            counts[sentiment] += 1

            results.append({
                "review_id": review["review_id"],
                "customer_id": review["customer_id"],
                "customer_name": review["customer_name"],
                "caterer_id": review["caterer_id"],
                "caterer_name": review["caterer_name"],
                "rating": review["rating"],
                "review_text": text,
                "sentiment": sentiment,
                "positive_score": analysis["positive_score"],
                "negative_score": analysis["negative_score"],
                "score": analysis["score"],
                "created_at": str(review["created_at"])
            })

        total = len(results)

        output = {
            "total_reviews_in_database": len(reviews),
            "total_reviews_analyzed": total,
            "empty_reviews_skipped": empty_reviews,
            "method": "Rule-based text sentiment lexicon",
            "sentiment_counts": counts,
            "sentiment_percentages": {
                label: round(count / total * 100, 2)
                if total else 0
                for label, count in counts.items()
            },
            "reviews": results
        }

        print(json.dumps(output, ensure_ascii=False, indent=2))
        cursor.close()

    except mysql.connector.Error as error:
        raise SystemExit(
            f"Could not read reviews from MySQL: {error}"
        )

    finally:
        if connection and connection.is_connected():
            connection.close()


if __name__ == "__main__":
    main()
