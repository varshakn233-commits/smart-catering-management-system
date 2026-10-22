
import os
from pathlib import Path

from dotenv import dotenv_values
import mysql.connector

# Project root is the parent of the ml folder
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Read database settings without printing any passwords
env_path = PROJECT_ROOT / "backend" / ".env"

if not env_path.exists():
    env_path = PROJECT_ROOT / ".env"

config = dotenv_values(env_path)

required_keys = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]

missing = [
    key for key in required_keys
    if config.get(key) is None
]

if missing:
    print("Missing database settings:", ", ".join(missing))
    print("Check the location of your existing .env file.")
    raise SystemExit(1)

try:
    connection = mysql.connector.connect(
        host=config["DB_HOST"],
        user=config["DB_USER"],
        password=config["DB_PASSWORD"],
        database=config["DB_NAME"],
        port=int(config.get("DB_PORT") or 3306),
        connection_timeout=10
    )

    print("MySQL connection successful!")
    print("\nDatabase tables and row counts:\n")

    cursor = connection.cursor()
    cursor.execute("SHOW TABLES")

    tables = [row[0] for row in cursor.fetchall()]

    for table in tables:
        # Table names come from MySQL itself and are quoted safely.
        escaped_table = table.replace("`", "``")
        cursor.execute(f"SELECT COUNT(*) FROM `{escaped_table}`")
        count = cursor.fetchone()[0]
        print(f"{table}: {count} rows")

    cursor.close()
    connection.close()

except mysql.connector.Error as error:
    print("Database connection/query failed:", error)
