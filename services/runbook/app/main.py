import json
import logging
import os
from uuid import UUID

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Runbook Service")
logger = logging.getLogger("runbook")


# 1. Define an individual runbook step
class RunbookStep(BaseModel):
    order: int = Field(ge=1)
    title: str = Field(min_length=1)
    instructions: str = Field(min_length=1)
    completed: bool = False


# 2. Define the request body for creating a runbook
class RunbookCreate(BaseModel):
    incident_id: UUID
    name: str = Field(min_length=1)
    steps: list[RunbookStep]


# 3. Connect to PostgreSQL
def get_db():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        connect_timeout=5,
    )


# 4. Existing health endpoint
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "incidentcmd-runbook"
    }


# 5. Create and store a runbook
@app.post("/runbooks", status_code=201)
def create_runbook(rb: RunbookCreate):

    orders = [step.order for step in rb.steps]

    if len(orders) != len(set(orders)):
        raise HTTPException(
            status_code=422,
            detail="Runbook step orders must be unique"
        )

    conn = None

    try:
        conn = get_db()

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO runbooks (incident_id, name, steps)
                VALUES (%s, %s, %s)
                RETURNING *
                """,
                (
                    str(rb.incident_id),
                    rb.name,
                    json.dumps([
                        step.model_dump()
                        for step in sorted(
                            rb.steps,
                            key=lambda s: s.order
                        )
                    ])
                )
            )

            result = dict(cur.fetchone())

        conn.commit()

        logger.info(
            "Created runbook for incident %s",
            rb.incident_id
        )

        return result

    except psycopg2.errors.ForeignKeyViolation:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    except (psycopg2.Error, KeyError, ValueError):
        if conn:
            conn.rollback()

        logger.error("Runbook database operation failed")

        raise HTTPException(
            status_code=503,
            detail="Database operation failed"
        )

    finally:
        if conn:
            conn.close()
