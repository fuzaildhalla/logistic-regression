from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
from pydantic import BaseModel, Field

app = FastAPI(title="Student Pass/Fail Predictor API")

# Enable CORS for frontend (React)
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


@app.get("/")
def read_root():
    return {
        "message": "Student Result Prediction API is running",
        "docs_url": "/docs",
        "endpoints": {"predict": "/predict"},
    }


@app.post("/predict")
def predict_result(data: StudentInput):
    input_df = pd.DataFrame({"StudyHours": [data.StudyHours]})
    pred = int(model.predict(input_df)[0])
    prob = float(model.predict_proba(input_df)[0][1])

    return {
        "prediction": "Pass" if pred == 1 else "Fail",
        "pass_probability": round(prob, 2),
    }
