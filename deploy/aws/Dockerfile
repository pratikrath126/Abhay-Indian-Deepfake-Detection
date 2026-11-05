FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1

WORKDIR /app
COPY deploy/aws/requirements.txt ./requirements-aws.txt

# Use CPU-only PyTorch wheels; this service runs inference on a small Lightsail VM.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu \
      torch==2.1.0+cpu torchvision==0.16.0+cpu \
    && pip install --no-cache-dir -r requirements-aws.txt

COPY ml_engine/api.py ml_engine/predict.py ml_engine/metadata.py ml_engine/model.pth ./

EXPOSE 8000
CMD ["python", "api.py"]
