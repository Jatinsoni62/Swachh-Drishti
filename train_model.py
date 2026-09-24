"""
Swachh-Drishti: YOLO Training & Spatial Receptacle Filter Pipeline
===================================================================
Enforces the core municipal rule:
"Spitting into a dustbin or bucket is LAWFUL CIVIC DISPOSAL and NOT a violation."

Features:
1. Directly accesses and indexes the prototype 'images/' directory.
2. Trains YOLOv8/YOLO11 on custom dataset (with dustbin_bucket & compliant_disposal classes).
3. Spatial Intersection Filter: Suppresses violations if the trajectory endpoint
   falls inside or near the bounding box of a detected dustbin/bucket/spittoon.
"""

import os
import sys
import glob
import shutil
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "images")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

def check_dataset_status():
    """Inspects the local images directory and annotation files."""
    if not os.path.exists(IMAGES_DIR):
        print(f"[!] Warning: '{IMAGES_DIR}' not found.")
        return 0, 0

    img_extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.avif")
    images = []
    for ext in img_extensions:
        images.extend(glob.glob(os.path.join(IMAGES_DIR, ext)))

    labels = glob.glob(os.path.join(IMAGES_DIR, "*.txt"))
    print(f"[*] Workspace images path: {IMAGES_DIR}")
    print(f"[*] Found {len(images)} raw images in 'images/' folder.")
    print(f"[*] Found {len(labels)} YOLO annotation txt files in 'images/' folder.")
    
    if len(images) > 0:
        print("\n[✓] Local images detected:")
        for idx, img in enumerate(images[:6]):
            print(f"    - [{idx+1}] {os.path.basename(img)} ({os.path.getsize(img) // 1024} KB)")
        if len(images) > 6:
            print(f"    ... and {len(images) - 6} more images in 'images/' folder.\n")

    return len(images), len(labels)

def prepare_dataset_splits(val_ratio=0.2):
    """
    Organizes images from 'images/' into YOLO training structure:
    dataset/images/train, dataset/images/val
    """
    img_extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.avif")
    images = []
    for ext in img_extensions:
        images.extend(glob.glob(os.path.join(IMAGES_DIR, ext)))

    if not images:
        print("[!] No images found in 'images/' to prepare.")
        return False

    train_img_dir = os.path.join(DATASET_DIR, "images", "train")
    val_img_dir = os.path.join(DATASET_DIR, "images", "val")
    train_lbl_dir = os.path.join(DATASET_DIR, "labels", "train")
    val_lbl_dir = os.path.join(DATASET_DIR, "labels", "val")

    for d in [train_img_dir, val_img_dir, train_lbl_dir, val_lbl_dir]:
        os.makedirs(d, exist_ok=True)

    random.seed(42)
    shuffled_imgs = list(images)
    random.shuffle(shuffled_imgs)

    split_idx = int(len(shuffled_imgs) * (1 - val_ratio))
    train_imgs = shuffled_imgs[:split_idx]
    val_imgs = shuffled_imgs[split_idx:]

    print(f"[*] Preparing dataset splits: {len(train_imgs)} train images, {len(val_imgs)} val images...")

    for img in train_imgs:
        dest = os.path.join(train_img_dir, os.path.basename(img))
        shutil.copy2(img, dest)
        # Check matching label
        base_name = os.path.splitext(os.path.basename(img))[0]
        lbl = os.path.join(IMAGES_DIR, f"{base_name}.txt")
        if os.path.exists(lbl):
            shutil.copy2(lbl, os.path.join(train_lbl_dir, f"{base_name}.txt"))

    for img in val_imgs:
        dest = os.path.join(val_img_dir, os.path.basename(img))
        shutil.copy2(img, dest)
        base_name = os.path.splitext(os.path.basename(img))[0]
        lbl = os.path.join(IMAGES_DIR, f"{base_name}.txt")
        if os.path.exists(lbl):
            shutil.copy2(lbl, os.path.join(val_lbl_dir, f"{base_name}.txt"))

    print("[✓] Dataset preparation complete! Structure ready at dataset/")
    return True

def train_yolo_model(data_yaml_path=os.path.join(DATASET_DIR, "data.yaml"), epochs=50, imgsz=640, model_type="yolov8n.pt"):
    """
    Trains Ultralytics YOLO model on custom dataset with receptacle awareness.
    Run via:
        python train_model.py --train
    """
    try:
        from ultralytics import YOLO
    except ImportError:
        print("\n[!] Ultralytics not installed in local environment.")
        print("    Install locally: pip install ultralytics")
        print("    Or run in Google Colab (Free GPU):")
        print("      !pip install ultralytics")
        print("      from ultralytics import YOLO")
        print("      model = YOLO('yolov8n.pt')")
        print(f"      model.train(data='{data_yaml_path}', epochs={epochs}, imgsz={imgsz})")
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
        expanded_rx1 = max(0.0, rx1 - buffer_margin)
        expanded_ry1 = max(0.0, ry1 - buffer_margin)
        expanded_rx2 = min(1.0, rx2 + buffer_margin)
        expanded_ry2 = min(1.0, ry2 + buffer_margin)

        inter_x1 = max(sx1, expanded_rx1)
        inter_y1 = max(sy1, expanded_ry1)
        inter_x2 = min(sx2, expanded_rx2)
        inter_y2 = min(sy2, expanded_ry2)

        if inter_x1 < inter_x2 and inter_y1 < inter_y2:
            return True, "Suppressed: Spitting occurred into/near detected municipal dustbin/bucket. 0 FINE."

    return False, "Confirmed: Trajectory landed on public road/sidewalk surface."

if __name__ == "__main__":
    print("=" * 70)
    print("  SWACHH-DRISHTI: AI Computer Vision Training & Compliance Logic")
    print("=" * 70)
    img_count, lbl_count = check_dataset_status()
    
    if len(sys.argv) > 1:
        flag = sys.argv[1]
        if flag == "--prepare":
            prepare_dataset_splits()
        elif flag == "--train":
            prepare_dataset_splits()
            train_yolo_model()
        elif flag == "--inspect":
            print(f"[i] Dataset inspect complete: {img_count} images found.")
    else:
        print("[i] Available CLI commands:")
        print("    python train_model.py --inspect   # Inspect all 36 images in images/")
        print("    python train_model.py --prepare   # Organize images/ into train/val splits")
        print("    python train_model.py --train     # Prepare dataset & execute YOLO model training\n")

