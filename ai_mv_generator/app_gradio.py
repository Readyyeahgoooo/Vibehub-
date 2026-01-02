import gradio as gr
import os
import json
import shutil
from director import Director
from artist import Artist
from editor import Editor

# Ensure output directories exist
PROJECT_DIR = "gradio_output"
os.makedirs(PROJECT_DIR, exist_ok=True)

def analyze_audio(audio_file):
    """Step 1: Analyze audio and return storyboard JSON for editing."""
    if not audio_file:
        return None, "Please upload an audio file first."
    
    # Clean previous run
    if os.path.exists(PROJECT_DIR):
        shutil.rmtree(PROJECT_DIR)
    os.makedirs(PROJECT_DIR, exist_ok=True)
    
    # Copy audio to project dir
    audio_filename = os.path.basename(audio_file)
    saved_audio_path = os.path.join(PROJECT_DIR, audio_filename)
    shutil.copy(audio_file, saved_audio_path)
    
    # Run Director
    director = Director(saved_audio_path)
    director.load_audio()
    cuts = director.detect_beats(min_interval=5.0)
    storyboard_path = os.path.join(PROJECT_DIR, "storyboard.json")
    storyboard = director.generate_storyboard(cuts, storyboard_path)
    
    # Return JSON as string for editing
    return json.dumps(storyboard, indent=4), "Audio analyzed! You can edit the Storyboard JSON below, then click 'Generate Video'."

def generate_video(storyboard_json, openrouter_key, hf_token):
    """Step 2: Generate video from (edited) storyboard."""
    
    # Set ENV vars from UI inputs if provided (allows user to paste keys)
    if openrouter_key:
        os.environ["OPENROUTER_API_KEY"] = openrouter_key
    if hf_token:
        os.environ["HUGGINGFACE_API_TOKEN"] = hf_token
        
    storyboard_path = os.path.join(PROJECT_DIR, "storyboard.json")
    
    # Save the edited JSON back to file
    try:
        storyboard_data = json.loads(storyboard_json)
        with open(storyboard_path, 'w') as f:
            json.dump(storyboard_data, f, indent=4)
    except json.JSONDecodeError:
        return None, "Error: Invalid JSON format. Please check your edits."

    # Run Artist
    artist = Artist()
    # If keys are missing, it will degrade gracefully or fail
    if not os.getenv("OPENROUTER_API_KEY"):
         return None, "Error: OpenRouter API Key is missing."
    
    artist.enhance_prompts(storyboard_path)
    images_dir = os.path.join(PROJECT_DIR, "frames")
    artist.generate_images(storyboard_path, images_dir)
    
    # Run Editor
    editor = Editor()
    output_video = os.path.join(PROJECT_DIR, "final_video.mp4")
    editor.create_video(storyboard_path, output_video)
    
    return output_video, "Video generated successfully!"

# Define Gradio Interface
with gr.Blocks(title="VibeFrame: AI Music Video Generator") as app:
    gr.Markdown("# 🎵 VibeFrame: Zero-Cost AI Music Video Generator")
    
    with gr.Row():
        with gr.Column():
            audio_input = gr.Audio(type="filepath", label="Upload Music file")
            analyze_btn = gr.Button("1. Analyze Audio")
            
            storyboard_editor = gr.Code(language="json", label="Edit Storyboard (JSON)", lines=15)
            
            with gr.Accordion("API Keys (Optional if set in Space Secrets)", open=False):
                or_key_input = gr.Textbox(label="OpenRouter Key", type="password")
                hf_token_input = gr.Textbox(label="HuggingFace Token", type="password")
                
            generate_btn = gr.Button("2. Generate Video", variant="primary")
        
        with gr.Column():
            status_output = gr.Textbox(label="Status / Logs")
            video_output = gr.Video(label="Final Music Video")

    # Wire interactions
    analyze_btn.click(
        analyze_audio, 
        inputs=[audio_input], 
        outputs=[storyboard_editor, status_output]
    )
    
    generate_btn.click(
        generate_video,
        inputs=[storyboard_editor, or_key_input, hf_token_input],
        outputs=[video_output, status_output]
    )

if __name__ == "__main__":
    app.launch()
