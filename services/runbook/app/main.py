from fastapi import FastAPI

app = FastAPI(title="Runbook Service")

@app.get("/")
def root():
    return {"status": "ok", "service": "incidentcmd-runbook"}