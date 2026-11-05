---
title: ABHAY Deepfake Detector
emoji: 🔍
colorFrom: gray
colorTo: blue
sdk: gradio
sdk_version: 4.44.1
python_version: 3.11
app_file: app.py
pinned: false
---

# ABHAY on Hugging Face Spaces

This Space runs ABHAY deepfake face detection using EfficientNet-B0 + EXIF metadata heuristics.

## Included files
- `app.py`: Gradio UI entrypoint
- `predict.py`: EfficientNet-B0 inference
- `metadata.py`: EXIF-based metadata analysis
- `model.pth`: trained weights

## Notes
- Space runtime installs dependencies from `requirements.txt`.
- If the Space fails at startup, check logs for missing model or dependency issues.
