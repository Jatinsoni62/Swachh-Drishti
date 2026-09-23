"""
Swachh-Drishti: YOLO Training & Spatial Receptacle Filter Pipeline
===================================================================
Enforces the core municipal rule:
"Spitting into a dustbin or bucket is LAWFUL CIVIC DISPOSAL and NOT a violation."

Features:
1. Trains YOLOv8/YOLO11 on custom dataset (with dustbin_bucket class).
2. Spatial Intersection Filter: Suppresses violations if the trajectory endpoint
   falls inside or near the bounding box of a detected dustbin/bucket/spittoon.
"""

import os
import sys
import glob

def check_dataset_status():
    """Inspects the local images directory and annotation files."""
    images_dir = os.path.join(os.path.dirname(__file__), "images")
    if not os.path.exists(images_dir):
        print(f"[!] Warning: '{images_dir}' not found.")
        return 0, 0

    img_extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.avif")
    images = []
    for ext in img_extensions:
        images.extend(glob.glob(os.path.join(images_dir, ext)))

    labels = glob.glob(os.path.join(images_dir, "*.txt"))
    print(f"[*] Found {len(images)} raw images in 'images/' folder.")
    print(f"[*] Found {len(labels)} YOLO annotation txt files in 'images/' folder.")
    
    if len(labels) == 0:
        print("\n[!] Note: You have uploaded the raw images, but YOLO model training requires")
        print("    annotation text files (.txt) matching each image, or a Roboflow export zip.")
        print("    See 'dataset/README.md' for steps to export or provide annotations.\n")
    return len(images), len(labels)

def train_yolo_model(data_yaml_path="dataset/data.yaml", epochs=50, imgsz=640, model_type="yolov8n.pt"):
    """
    Trains Ultralytics YOLO model on custom dataset with receptacle awareness.
    Run via:
        python train_model.py
    Or in Google Colab:
        !pip install ultralytics
        !python train_model.py
    """
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[!] Ultralytics not installed. Install via: pip install ultralytics")
        print("    Or run in Google Colab: !pip install ultralytics")
        return

    print(f"[*] Initializing model: {model_type}...")
    model = YOLO(model_type)

    print(f"[*] Starting training on {data_yaml_path} for {epochs} epochs...")
    results = model.train(
        data=data_yaml_path,
        epochs=epochs,
        imgsz=imgsz,
        batch=16,
        name="swachh_drishti_receptacle_model",
        save=True,
        plots=True
    )
    print("[✓] Training complete! Saved weights to runs/detect/swachh_drishti_receptacle_model/weights/best.pt")
    return results

def is_violation_suppressed_by_receptacle(spit_box, receptacle_boxes, buffer_margin=0.08):
    """
    Rule implementation:
    If spitting trajectory/landing zone intersects or falls within the proximity
    margin of a detected dustbin/bucket, SUPPRESS violation (lawful civic action).
    
    spit_box: [x1, y1, x2, y2] normalized
    receptacle_boxes: list of [x1, y1, x2, y2] bounding boxes for dustbins/buckets
    """
    sx1, sy1, sx2, sy2 = spit_box

    for rx1, ry1, rx2, ry2 in receptacle_boxes:
        # Expand receptacle box by buffer margin to account for trajectory arc
        expanded_rx1 = max(0.0, rx1 - buffer_margin)
        expanded_ry1 = max(0.0, ry1 - buffer_margin)
        expanded_rx2 = min(1.0, rx2 + buffer_margin)
        expanded_ry2 = min(1.0, ry2 + buffer_margin)

        # Check box intersection
        inter_x1 = max(sx1, expanded_rx1)
        inter_y1 = max(sy1, expanded_ry1)
        inter_x2 = min(sx2, expanded_rx2)
        inter_y2 = min(sy2, expanded_ry2)

        if inter_x1 < inter_x2 and inter_y1 < inter_y2:
            return True, "Suppressed: Spitting occurred into/near detected municipal dustbin/bucket."

    return False, "Confirmed: Trajectory landed on public road/sidewalk surface."

if __name__ == "__main__":
    print("=" * 70)
    print("  SWACHH-DRISHTI: AI Computer Vision Training & Compliance Logic")
    print("=" * 70)
    img_count, lbl_count = check_dataset_status()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--train":
        train_yolo_model()
    else:
        print("[i] To execute YOLO model training, run:")
        print("    python train_model.py --train")
        print("    Or run the commands outlined in dataset/README.md in Google Colab / Kaggle.\n")
