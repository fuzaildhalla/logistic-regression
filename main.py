import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import joblib
import pandas as pd
from pydantic import BaseModel, Field

app = FastAPI(title="Student Pass/Fail Predictor API")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("student_result.pkl")


class StudentInput(BaseModel):
    StudyHours: float = Field(..., ge=0, le=24, description="Daily study hours between 0 and 24")


@app.post("/predict")
def predict_result(data: StudentInput):
    input_df = pd.DataFrame({"StudyHours": [data.StudyHours]})
    pred = int(model.predict(input_df)[0])
    prob = float(model.predict_proba(input_df)[0][1])

    return {
        "prediction": "Pass" if pred == 1 else "Fail",
        "pass_probability": round(prob, 2),
    }


# Mount and serve compiled React frontend if present
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/")
def serve_root():
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "message": "Student Result Prediction API is running",
        "docs_url": "/docs",
        "endpoints": {"predict": "/predict"},
    }
