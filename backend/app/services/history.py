from __future__ import annotations
import sqlite3
import json
import os
from typing import Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "history.db")


def _conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_title TEXT,
                job_description TEXT,
                overall_score INTEGER,
                skills_score INTEGER,
                experience_score INTEGER,
                education_score INTEGER,
                summary TEXT,
                full_result TEXT,
                created_at TEXT
            )
        """)


def save_result(job_description: str, result: dict) -> int:
    job_title = job_description.strip().split("\n")[0][:80]
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    with _conn() as conn:
        cur = conn.execute(
            """INSERT INTO history
               (job_title, job_description, overall_score, skills_score,
                experience_score, education_score, summary, full_result, created_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (
                job_title,
                job_description[:2000],
                result["overall_score"],
                result["skills"]["score"],
                result["experience"]["score"],
                result["education"]["score"],
                result["summary"],
                json.dumps(result),
                now,
            ),
        )
        return cur.lastrowid


def get_history(limit: int = 20) -> list:
    with _conn() as conn:
        rows = conn.execute(
            "SELECT id, job_title, overall_score, skills_score, experience_score, "
            "education_score, summary, created_at FROM history ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]


def get_entry(entry_id: int) -> Optional[dict]:
    with _conn() as conn:
        row = conn.execute(
            "SELECT full_result FROM history WHERE id=?", (entry_id,)
        ).fetchone()
    if row:
        return json.loads(row["full_result"])
    return None


def delete_entry(entry_id: int):
    with _conn() as conn:
        conn.execute("DELETE FROM history WHERE id=?", (entry_id,))
