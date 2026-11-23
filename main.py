from fastapi import FastAPI
import joblib
import pandas as pd  # <-- ADD THIS LINE
from pydantic import BaseModel

app = FastAPI()

model = joblib.load("student_result.pkl")


class StudentInput(BaseModel):
    StudyHours: float


@app.get("/")
def test():
    return {"message": "running"}


@app.post("/predict")
def predict_result(data: StudentInput):
    input_df = pd.DataFrame({"StudyHours": [data.StudyHours]})
    pred = int(model.predict(input_df)[0])
    prob = float(model.predict_proba(input_df)[0][1])

    return {
        "prediction": "Pass" if pred == 1 else "Fail",
        "pass_probability": round(prob, 2),
    }