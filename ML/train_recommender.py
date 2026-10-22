
from pathlib import Path
from collections import defaultdict

import joblib
import pandas as pd
import mysql.connector
from dotenv import dotenv_values
from sklearn.metrics.pairwise import cosine_similarity


# --------------------------------------------------
# 1. PATHS AND DATABASE CONFIGURATION
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = PROJECT_ROOT / "ml" / "models"
MODEL_PATH = MODEL_DIR / "caterer_recommender.joblib"

env_path = PROJECT_ROOT / "backend" / ".env"
if not env_path.exists():
    env_path = PROJECT_ROOT / ".env"

config = dotenv_values(env_path)

required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]
missing = [key for key in required if config.get(key) is None]

if missing:
    raise SystemExit(
        "Missing database settings: " + ", ".join(missing)
    )


# --------------------------------------------------
# 2. READ EXISTING DATABASE
# --------------------------------------------------

connection = mysql.connector.connect(
    host=config["DB_HOST"],
    user=config["DB_USER"],
    password=config["DB_PASSWORD"],
    database=config["DB_NAME"],
    port=int(config.get("DB_PORT") or 3306),
    connection_timeout=10,
)

try:
    caterers = pd.read_sql(
        """
        SELECT caterer_id, brand_name
        FROM caterers
        WHERE status = 'approved'
        ORDER BY caterer_id
        """,
        connection,
    )

    enquiries = pd.read_sql(
        """
        SELECT customer_id, caterer_id, status
        FROM customer_enquiries
        WHERE customer_id IS NOT NULL
          AND caterer_id IS NOT NULL
        """,
        connection,
    )

    bookings = pd.read_sql(
        """
        SELECT
            er.customer_id,
            c.caterer_id,
            er.status
        FROM event_request er
        JOIN caterers c
          ON LOWER(TRIM(er.caterer_email))
           = LOWER(TRIM(c.email))
        WHERE er.customer_id IS NOT NULL
        """,
        connection,
    )

    saved = pd.read_sql(
        """
        SELECT customer_id, caterer_id
        FROM saved_caterers
        WHERE customer_id IS NOT NULL
          AND caterer_id IS NOT NULL
        """,
        connection,
    )

finally:
    connection.close()


# --------------------------------------------------
# 3. KEEP APPROVED CATERERS ONLY
# --------------------------------------------------

approved_ids = set(caterers["caterer_id"].astype(int))

enquiries = enquiries[
    enquiries["caterer_id"].isin(approved_ids)
].copy()

bookings = bookings[
    bookings["caterer_id"].isin(approved_ids)
].copy()

saved = saved[
    saved["caterer_id"].isin(approved_ids)
].copy()

if caterers.empty:
    raise SystemExit("No approved caterers found.")

# Customer-caterer positive interaction strengths.
# These are modelling weights, not measured probabilities.
interactions = defaultdict(float)
rejected_pairs = set()

for row in enquiries.itertuples(index=False):
    customer_id = int(row.customer_id)
    caterer_id = int(row.caterer_id)

    weight = (
        1.2 if row.status == "caterer_responded"
        else 1.0
    )

    interactions[(customer_id, caterer_id)] += weight


for row in bookings.itertuples(index=False):
    customer_id = int(row.customer_id)
    caterer_id = int(row.caterer_id)
    status = str(row.status).lower()

    if status == "rejected":
        rejected_pairs.add((customer_id, caterer_id))

    elif status in {
        "payment_pending",
        "accepted",
    }:
        interactions[(customer_id, caterer_id)] += 1.8

    elif status in {
        "confirmed",
        "preparing",
        "on_the_way",
        "event_started",
        "completed",
    }:
        interactions[(customer_id, caterer_id)] += 2.5


for row in saved.itertuples(index=False):
    customer_id = int(row.customer_id)
    caterer_id = int(row.caterer_id)

    interactions[(customer_id, caterer_id)] += 2.0


# --------------------------------------------------
# 4. BUILD CUSTOMER-CATERER MATRIX
# --------------------------------------------------

customer_ids = sorted({
    customer_id
    for customer_id, _ in interactions
})

caterer_ids = caterers["caterer_id"].astype(int).tolist()

if not customer_ids or not interactions:
    raise SystemExit(
        "No usable enquiry, booking or saved-caterer "
        "interactions found."
    )

matrix = pd.DataFrame(
    0.0,
    index=customer_ids,
    columns=caterer_ids,
)

for (customer_id, caterer_id), score in interactions.items():
    # Cap repeated interactions so one pair does not
    # dominate the entire model.
    matrix.at[customer_id, caterer_id] = min(score, 5.0)


# --------------------------------------------------
# 5. TRAIN ITEM-BASED SIMILARITY MODEL
# --------------------------------------------------

# Each row represents a customer.
# Each column represents an approved caterer.
# Similarity is calculated between caterer columns.
similarity = cosine_similarity(matrix.T)

similarity_df = pd.DataFrame(
    similarity,
    index=caterer_ids,
    columns=caterer_ids,
)

global_scores = matrix.sum(axis=0).to_dict()

# Rating averages are currently tied across caterers,
# so they are not used to break recommendation ties.


# --------------------------------------------------
# 6. SAVE THE TRAINED MODEL
# --------------------------------------------------

MODEL_DIR.mkdir(parents=True, exist_ok=True)

model = {
    "model_type": "item_based_collaborative_filtering",
    "caterer_ids": caterer_ids,
    "caterer_names": {
        int(row.caterer_id): row.brand_name
        for row in caterers.itertuples(index=False)
    },
    "customer_item_matrix": matrix,
    "item_similarity": similarity_df,
    "global_scores": {
        int(key): float(value)
        for key, value in global_scores.items()
    },
    "rejected_pairs": sorted(
        [list(pair) for pair in rejected_pairs]
    ),
    "training_interaction_count": len(interactions),
}

joblib.dump(model, MODEL_PATH)


# --------------------------------------------------
# 7. TRAINING SUMMARY
# --------------------------------------------------

print("\n====================================")
print("ANNAPRIYA RECOMMENDATION MODEL")
print("====================================")
print("Training completed successfully.")
print("Model type: Item-based collaborative filtering")
print("Approved caterers:", len(caterer_ids))
print("Customers with positive interactions:", len(customer_ids))
print("Unique customer-caterer pairs:", len(interactions))
print("Rejected customer-caterer pairs:", len(rejected_pairs))
print("Model saved to:", MODEL_PATH)
print("\nNo database records were changed.")
