# Swachh-Drishti Dataset & Training Guide

This guide explains how to provide your annotated dataset and train the computer vision model with the **Dustbin / Bucket Compliance Rule**.

---

## 1. Current Status of Your Dataset

- **Raw Images Detected:** 36 images are currently in your `images/` folder (from Roboflow export).
- **Rule Enforced:** Spitting in a dustbin, bucket, spittoon, or waste receptacle is **Lawful Civic Disposal** and **never a violation**.

---

## 2. How to Provide Annotations / Dataset

Object detection models (YOLOv8, YOLO11) require both **images** and **annotation files** (`.txt` bounding box coordinates). You can provide them in any of the following 3 ways:

### Option A: Provide Roboflow Export Link / Download (Recommended)
If your images were exported from Roboflow:
1. In your Roboflow project, click **Export Dataset** $\rightarrow$ choose format **YOLOv8**.
2. Download the `.zip` file containing `train/`, `valid/`, `test/` folders and `data.yaml`.
3. Unzip and drop the contents into the `dataset/` folder in this workspace:
   ```
   dataset/
   ├── data.yaml
   ├── images/
   │   ├── train/
   │   └── val/
   └── labels/
       ├── train/
       └── val/
   ```

### Option B: Drop Label `.txt` Files into the Workspace
If you have the corresponding `.txt` label files for the 36 images in `images/`, simply paste or place them into `images/` or `dataset/labels/train/`.

### Option C: Google Drive / Zip Archive
You can paste a shareable Google Drive / OneDrive link to your labeled dataset zip, and we can extract and train the model directly.

---

## 3. Class Definitions (Enforcing Dustbin Compliance)

In `dataset/data.yaml`:
```yaml
names:
  0: person
  1: spitting_violation    # Spitting on road, wall, pavement
  2: dustbin_bucket         # Municipal dustbin, spittoon, bucket
  3: compliant_disposal     # Waste discharged into receptacle (NO VIOLATION)
```

---

## 4. How the "Spit in Dustbin = No Violation" Rule Works

1. **Object Detection Layer:**
   - Detects all pedestrians (`person`), spitting gestures (`spitting_violation`), and waste containers (`dustbin_bucket`).
2. **Spatial Intersection & Trajectory Check:**
   - When a spitting gesture occurs, the model traces the ballistic arc vector from the mouth keypoint.
   - If the trajectory termination coordinates fall within or intersect the bounding box of a `dustbin_bucket`, the event is classified as:
     $$\text{Classification} = \text{COMPLIANT\_DISPOSAL}$$
     $$\text{Challan Issuance} = \text{SUPPRESSED (NO FINE)}$$
3. **Audit Trail:**
   - The event is logged in municipal telemetry as **"Compliant Civic Disposal"**, reinforcing positive civic habits.

---

## 5. Training in Google Colab (Free GPU)

To train on free GPU in Google Colab:
```python
# 1. Install Ultralytics
!pip install ultralytics

# 2. Train model
from ultralytics import YOLO
model = YOLO('yolov8n.pt')
results = model.train(data='dataset/data.yaml', epochs=50, imgsz=640)

# 3. Export to ONNX or web format for browser edge inference
model.export(format='onnx')
```
