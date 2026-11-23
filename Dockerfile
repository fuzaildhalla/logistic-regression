# 1. Start with an official lightweight Python image
FROM python:3.12-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy and install dependencies first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy your FastAPI app and trained model into the container
COPY main.py .
COPY student_result.pkl .

# 5. Expose the port Render uses
EXPOSE 8000

# 6. Start the FastAPI server (Render injects the $PORT variable)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]