
from pathlib import Path
from dotenv import dotenv_values
import mysql.connector

PROJECT_ROOT = Path(__file__).resolve().parent.parent

env_path = PROJECT_ROOT / "backend" / ".env"
if not env_path.exists():
    env_path = PROJECT_ROOT / ".env"

config = dotenv_values(env_path)

connection = mysql.connector.connect(
    host=config["DB_HOST"],
    user=config["DB_USER"],
    password=config["DB_PASSWORD"],
    database=config["DB_NAME"],
    port=int(config.get("DB_PORT") or 3306),
)

cursor = connection.cursor()

def show_columns(table):
    print(f"\n--- {table}: columns ---")
    cursor.execute(f"SHOW COLUMNS FROM `{table}`")
    print(", ".join(row[0] for row in cursor.fetchall()))

# Check the structure of the recommendation-related tables.
for table in [
    "customers",
    "caterers",
    "customer_enquiries",
    "event_request",
    "reviews",
    "saved_caterers",
]:
    show_columns(table)

print("\n--- Caterer approval status ---")
cursor.execute("""
    SELECT status, COUNT(*)
    FROM caterers
    GROUP BY status
""")
for row in cursor.fetchall():
    print(row)

print("\n--- Caterer review summary ---")
cursor.execute("""
    SELECT
        c.caterer_id,
        c.brand_name,
        c.status,
        COUNT(r.review_id) AS review_count,
        ROUND(AVG(r.rating), 2) AS average_rating
    FROM caterers c
    LEFT JOIN reviews r ON r.caterer_id = c.caterer_id
    GROUP BY c.caterer_id, c.brand_name, c.status
    ORDER BY c.caterer_id
""")
for row in cursor.fetchall():
    print(row)

for column in ["event_type", "food_type", "package_name", "status"]:
    print(f"\n--- Enquiry distribution: {column} ---")
    cursor.execute(f"""
        SELECT `{column}`, COUNT(*)
        FROM customer_enquiries
        GROUP BY `{column}`
        ORDER BY COUNT(*) DESC
    """)
    for row in cursor.fetchall():
        print(row)

print("\n--- Booking status distribution ---")
cursor.execute("""
    SELECT status, COUNT(*)
    FROM event_request
    GROUP BY status
    ORDER BY status
""")
for row in cursor.fetchall():
    print(row)

print("\n--- Saved caterer interactions ---")
cursor.execute("""
    SELECT COUNT(*), COUNT(DISTINCT customer_id),
           COUNT(DISTINCT caterer_id)
    FROM saved_caterers
""")
print(cursor.fetchone())

cursor.close()
connection.close()

print("\nInspection completed. No database records were changed.")
