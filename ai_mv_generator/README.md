---
title: VibeFrame
emoji: 🎵
colorFrom: purple
colorTo: pink
sdk: gradio
sdk_version: 4.19.2
app_file: app_gradio.py
pinned: false
---

# VibeFrame: Zero-Cost AI Music Video Generator

A Python tool to create stylized music videos using audio beat detection and free AI generation APIs.

## Requirements

1.  Python 3.8+
2.  `ffmpeg` installed on your system (Required for MoviePy/Librosa)
    *   Mac: `brew install ffmpeg`
    *   Windows: Download from ffmpeg.org and add to PATH

## Setup

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

2.  (Optional but Recommended) Set up API Keys in `.env`:
    *   Copy `.env.example` to `.env`
    *   **OpenRouter Key**: For better prompt enhancement (turning "dog" into "cinematic shot of a dog..."). Get free models key at [openrouter.ai](https://openrouter.ai).
    *   **HuggingFace Token**: For higher rate limits on image generation. Get one at [huggingface.co](https://huggingface.co/settings/tokens).

## Usage

### 1. Basic Usage
Run the script with your audio file:

```bash
python run.py song.mp3
```

This will:
1.  Analyze `song.mp3` for beats.
2.  Generate a `storyboard.json` in `project_output/`.
3.  **PAUSE**: Wait for you to edit the JSON file if you want to customize scenes.
4.  Generate prompts and images (using Free AI).
5.  Compile `final_video.mp4`.

### 2. Customizing the Storyboard
When the script pauses, open `project_output/storyboard.json`.
You can change:
*   `visual_style`: The global style (e.g., "Cyberpunk", "Oil Painting", "1990s Anime").
*   `description`: What happens in that specific scene.
*   `image_path`: (Advanced) Paste a local path to your own photo to use it instead of generating one.

### 3. Automatic Mode
If you trust the AI completely:

```bash
python run.py song.mp3 --auto
```

### 4. Advanced Options

```bash
python run.py song.mp3 --interval 8.0 --project_dir my_video_1
```
*   `--interval`: Minimum seconds between cuts.
*   `--project_dir`: Where to save files.

## Troubleshooting
*   **Audio Load Error**: Ensure `ffmpeg` is installed.
*   **Image Gen Failure**: Check your internet connection or HuggingFace token. The script uses the free inference API which can be busy.
