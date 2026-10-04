# VisionAI Studio

A browser-based AI Computer Vision project using TensorFlow.js and the COCO-SSD object detection model.

## Features
- Image upload and object detection
- Live webcam object detection
- Bounding boxes and confidence scores
- Responsive modern UI
- Runs mainly in the browser; no custom backend required

## Run locally
Open `index.html` in a browser. For camera access, a local server is recommended:
- VS Code + Live Server extension, or
- Python: `python -m http.server 8000`

Then visit `http://localhost:8000`.

## Deploy on GitHub Pages
1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md`.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/root`.
6. Save and wait for GitHub Pages to publish.

The site uses CDN-hosted TensorFlow.js and COCO-SSD, so internet access is required when the model loads.
