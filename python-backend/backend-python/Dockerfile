# NeuroEdge backend Dockerfile (minimal)
FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN apt-get update && apt-get install -y build-essential git curl && rm -rf /var/lib/apt/lists/*
RUN pip install --upgrade pip
RUN pip install -r backend-python/requirements.txt
ENV NEUROEDGE_VEC_DIM=256
EXPOSE 8000
CMD ["uvicorn", "backend-python.neuroedge_autonomous:app", "--host", "0.0.0.0", "--port", "8000"]
