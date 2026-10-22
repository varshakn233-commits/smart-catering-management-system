
import json
import sys
from pathlib import Path

import joblib
import mysql.connector
import numpy as np
from dotenv import dotenv_values


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "models" / "caterer_recommender.joblib"

ENV_PATH = BASE_DIR / "backend" / ".env"
if not ENV_PATH.exists():
    ENV_PATH = BASE_DIR / ".env"


def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide a customer ID."}))
        return

    try:
        customer_id = int(sys.argv[1])
    except ValueError:
        print(json.dumps({"error": "Invalid customer ID."}))
        return

    if not MODEL_PATH.exists():
        print(json.dumps({"error": "ML model not found. Train it first."}))
        return

    model = joblib.load(MODEL_PATH)
    config = dotenv_values(ENV_PATH)

    connection = None

    try:
        connection = mysql.connector.connect(
            host=config.get("DB_HOST", "localhost"),
            user=config.get("DB_USER"),
            password=config.get("DB_PASSWORD"),
            database=config.get("DB_NAME"),
            port=int(config.get("DB_PORT") or 3306),
        )

        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT customer_id
            FROM customers
            WHERE customer_id = %s
            """,
            (customer_id,),
        )
        if not cursor.fetchone():
            print(json.dumps({"error": "Customer not found."}))
            return

        cursor.execute(
            """
            SELECT caterer_id, brand_name
            FROM caterers
            WHERE LOWER(TRIM(status)) = 'approved'
            ORDER BY caterer_id
            """
        )
        caterers = cursor.fetchall()

        if not caterers:
            print(json.dumps({"recommendations": []}))
            return

        caterer_ids = list(model["caterer_ids"])
        matrix = model["customer_item_matrix"]
        similarity = np.asarray(model["item_similarity"], dtype=float)
        global_scores = model["global_scores"]

        # Start with popularity scores for customers who have no history.
        scores = {}

        for position, caterer_id in enumerate(caterer_ids):
            if hasattr(global_scores, "get"):
                scores[caterer_id] = float(
                    global_scores.get(caterer_id, 0)
                )
            else:
                scores[caterer_id] = float(global_scores[position])

        # Personalize recommendations when the customer has history.
        if customer_id in matrix.index:
            customer_vector = matrix.loc[customer_id].to_numpy(
                dtype=float
            )
            personalized_scores = customer_vector @ similarity

            for position, caterer_id in enumerate(caterer_ids):
                scores[caterer_id] = float(
                    personalized_scores[position]
                )

        # Penalize caterers associated with rejected bookings.
        rejected_pairs = set(
            tuple(pair) for pair in model.get("rejected_pairs", [])
        )

        for rejected_customer, rejected_caterer in rejected_pairs:
            if rejected_customer == customer_id:
                scores[rejected_caterer] = (
                    scores.get(rejected_caterer, 0) - 1000
                )

        # Prefer caterers the customer has not already interacted with.
        previously_seen = set()

        if customer_id in matrix.index:
            customer_vector = matrix.loc[customer_id]

            previously_seen = {
                int(caterer_id)
                for caterer_id, value in customer_vector.items()
                if value > 0
            }

        approved_ids = {int(c["caterer_id"]) for c in caterers}

        ranked = sorted(
            [
                c for c in caterers
                if int(c["caterer_id"]) in approved_ids
                and int(c["caterer_id"]) not in previously_seen
            ],
            key=lambda c: scores.get(int(c["caterer_id"]), 0),
            reverse=True,
        )

        # If fewer than three unseen caterers remain, fill from all
        # approved caterers so the dashboard can still show three.
        if len(ranked) < 3:
            selected_ids = {int(c["caterer_id"]) for c in ranked}

            remaining = sorted(
                [
                    c for c in caterers
                    if int(c["caterer_id"]) not in selected_ids
                ],
                key=lambda c: scores.get(int(c["caterer_id"]), 0),
                reverse=True,
            )

            ranked.extend(remaining[: 3 - len(ranked)])

        recommendations = [
            {
                "caterer_id": int(c["caterer_id"]),
                "brand_name": c["brand_name"],
                "score": round(
                    scores.get(int(c["caterer_id"]), 0), 4
                ),
            }
            for c in ranked[:3]
        ]

        print(json.dumps({"recommendations": recommendations}))

    except Exception:
        # Keep stdout suitable for the backend to parse as JSON.
        print(json.dumps({
            "error": "Recommendation generation failed. Check the database and ML model."
        }))
        sys.exit(1)

    finally:
        if connection and connection.is_connected():
            connection.close()


if __name__ == "__main__":
    main()
