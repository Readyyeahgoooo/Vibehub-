# Design Document: AI Music Video Generator

## Overview

VibeFrame 2.0 is a comprehensive AI music video generation system that transforms audio files into visually coherent, professionally edited music videos. The system employs a multi-stage pipeline: audio analysis, intelligent scene planning, character-consistent video generation, and final assembly. The architecture prioritizes cost-free operation by leveraging open-source models (LongCat-Video, SHARP, Open-Sora) and free API tiers (OpenRouter, HuggingFace).

The system supports three video generation modes:
1. **LongCat-Video Mode**: Text-to-video and image-to-video with built-in continuation for character consistency
2. **SHARP Mode**: 2D image generation followed by 3D conversion and camera animation
3. **Hybrid Mode**: Combines static images with video generation for optimal quality/cost balance

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Gradio Web Interface                      │
│  (HuggingFace Spaces - CPU, handles UI and orchestration)       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Audio Analysis Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Librosa    │  │   Essentia   │  │  Madmom      │          │
│  │ Beat Detect  │  │ Drum Detect  │  │  Structure   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Scene Planning Layer                          │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  OpenRouter API (Gemini 2.0 Flash - Free)           │       │
│  │  - Analyzes audio features                           │       │
│  │  - Generates scene descriptions                      │       │
│  │  - Creates detailed video prompts                    │       │
│  │  - Maintains narrative coherence                     │       │
│  └──────────────────────────────────────────────────────┘       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Character Management Layer                      │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Character Descriptor Extraction & Injection         │       │
│  │  - Parses character attributes from first scene      │       │
│  │  - Injects character description into all prompts    │       │
│  │  - Manages reference images for I2V generation       │       │
│  └──────────────────────────────────────────────────────┘       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Video Generation Layer                         │
│  (Google Colab or Local GPU - Heavy computation)                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ LongCat-Video│  │ HunyuanVideo │  │    SHARP     │          │
│  │   (Primary)  │  │  (Fallback)  │  │ (Alternative)│          │
│  │              │  │              │  │              │          │
│  │ • T2V        │  │ • T2V        │  │ • Image Gen  │          │
│  │ • I2V        │  │ • I2V        │  │ • 2D→3D      │          │
│  │ • Continue   │  │ • Audio Sync │  │ • Camera Anim│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Video Assembly Layer                           │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  FFmpeg / MoviePy                                    │       │
│  │  - Concatenates video clips                          │       │
│  │  - Applies transitions                               │       │
│  │  - Synchronizes with audio                           │       │
│  │  - Exports final MP4                                 │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    HuggingFace Spaces (Free Tier)                │
│  - Gradio UI                                                     │
│  - Audio analysis (CPU)                                          │
│  - Scene planning (API calls)                                    │
│  - Project management                                            │
│  - Storyboard editing                                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ (Offload heavy computation)
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              Google Colab (Free Tier - T4 GPU)                   │
│  - Video generation (LongCat-Video, HunyuanVideo)               │
│  - 3D conversion (SHARP)                                         │
│  - Video assembly (FFmpeg)                                       │
│  - Returns final video URL                                       │
└─────────────────────────────────────────────────────────────────┘
                 │
                 │ (Alternative for users with GPU)
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Local GPU (Optional)                          │
│  - All video generation locally                                  │
│  - Faster processing                                             │
│  - No cloud dependencies                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Audio Analyzer Component

**Purpose**: Analyzes audio files to detect beats, drums, musical structure, and optimal cut points.

**Interface**:
```python
class AudioAnalyzer:
    def __init__(self, audio_path: str):
        """Initialize with path to audio file."""
        
    def load_audio(self) -> Tuple[np.ndarray, int]:
        """Load audio file and return waveform and sample rate."""
        
    def detect_beats(self, min_interval: float = 4.0) -> List[float]:
        """Detect beat timestamps with minimum interval between cuts."""
        
    def detect_drums(self) -> List[Tuple[float, float]]:
        """Detect drum hits and return (timestamp, strength) pairs."""
        
    def detect_structure(self) -> List[Dict[str, Any]]:
        """Detect musical sections (intro, verse, chorus, etc.)."""
        
    def analyze_features(self, start_time: float, end_time: float) -> Dict[str, float]:
        """Extract audio features (tempo, energy, mood) for a time range."""
        
    def generate_cut_points(self, strategy: str = "auto") -> List[CutPoint]:
        """Generate optimal cut points using specified strategy."""
```

**Key Methods**:
- `detect_beats()`: Uses librosa's `beat_track()` to find rhythmic pulses
- `detect_drums()`: Uses `onset_detect()` with percussive separation
- `detect_structure()`: Uses `agglomerative()` for structural segmentation
- `analyze_features()`: Extracts tempo, spectral centroid, RMS energy, zero-crossing rate

**Dependencies**: librosa, numpy, scipy

### 2. Scene Planner Component

**Purpose**: Generates creative scene descriptions and detailed video prompts using LLM.

**Interface**:
```python
class ScenePlanner:
    def __init__(self, openrouter_api_key: str):
        """Initialize with OpenRouter API key."""
        
    def generate_scene_descriptions(
        self, 
        cut_points: List[CutPoint],
        audio_features: List[Dict[str, float]],
        global_style: Optional[str] = None,
        user_theme: Optional[str] = None
    ) -> List[SceneDescription]:
        """Generate scene descriptions for all cut points."""
        
    def enhance_prompt(
        self, 
        description: str, 
        style: str,
        previous_scene: Optional[SceneDescription] = None
    ) -> str:
        """Convert scene description into detailed video generation prompt."""
        
    def generate_action_sequence(
        self,
        action: str,
        num_shots: int,
        character: str
    ) -> List[str]:
        """Break down an action into multiple connected shot prompts."""
        
    def analyze_mood(self, audio_features: Dict[str, float]) -> str:
        """Determine mood/emotion from audio features."""
```

**LLM Prompt Template**:
```
You are a creative director for music videos. Given the following audio analysis:
- Tempo: {tempo} BPM
- Energy: {energy} (0-1 scale)
- Section: {section} (intro/verse/chorus/bridge/outro)
- Duration: {duration} seconds
- Previous scene: {previous_description}

Generate a detailed scene description that:
1. Matches the musical mood and energy
2. Maintains narrative continuity with the previous scene
3. Includes specific character actions, camera angles, and lighting
4. Follows the global style: {global_style}

Output format:
{
  "description": "Brief scene summary",
  "character_action": "What the character is doing",
  "camera_angle": "Camera position and movement",
  "lighting": "Lighting setup and mood",
  "environment": "Setting and background details"
}
```

**Dependencies**: requests, json, OpenRouter API

### 3. Character Manager Component

**Purpose**: Maintains character consistency across all video scenes.

**Interface**:
```python
class CharacterManager:
    def __init__(self):
        """Initialize character manager."""
        
    def extract_character_description(self, first_prompt: str) -> CharacterDescriptor:
        """Parse character attributes from the first scene prompt."""
        
    def inject_character(self, prompt: str, character: CharacterDescriptor) -> str:
        """Inject character description into a scene prompt."""
        
    def get_reference_frame(self, video_path: str, frame_index: int = -1) -> np.ndarray:
        """Extract a frame from video to use as I2V reference."""
        
    def validate_consistency(self, generated_frame: np.ndarray) -> float:
        """Check if generated frame matches character descriptor (0-1 score)."""
        
    def create_character_lora(self, reference_images: List[str]) -> str:
        """Train a LoRA adapter for character consistency (advanced feature)."""
```

**Character Descriptor Structure**:
```python
@dataclass
class CharacterDescriptor:
    appearance: str  # "young woman with long black hair, blue eyes"
    clothing: str    # "wearing a red leather jacket and jeans"
    style: str       # "anime style, detailed, vibrant colors"
    age: Optional[str] = None
    ethnicity: Optional[str] = None
    distinctive_features: Optional[str] = None
```

**Dependencies**: opencv-python, numpy, PIL

### 4. Video Generator Component

**Purpose**: Generates video clips using AI models with multiple backend support.

**Interface**:
```python
class VideoGenerator:
    def __init__(self, model: str = "longcat", device: str = "auto"):
        """Initialize with model choice and device."""
        
    def generate_text_to_video(
        self, 
        prompt: str, 
        duration: float,
        resolution: Tuple[int, int] = (1920, 1080),
        fps: int = 24
    ) -> str:
        """Generate video from text prompt, return path to video file."""
        
    def generate_image_to_video(
        self,
        image_path: str,
        prompt: str,
        duration: float
    ) -> str:
        """Generate video from image + prompt."""
        
    def continue_video(
        self,
        previous_video_path: str,
        prompt: str,
        duration: float
    ) -> str:
        """Extend a video clip while maintaining visual consistency."""
        
    def generate_with_sharp(
        self,
        image_path: str,
        camera_path: List[CameraKeyframe],
        duration: float
    ) -> str:
        """Convert 2D image to 3D and animate camera."""
```

**Model Backends**:

#### LongCat-Video Backend
```python
class LongCatVideoBackend:
    def __init__(self, checkpoint_dir: str):
        """Load LongCat-Video model weights."""
        
    def text_to_video(self, prompt: str, num_frames: int) -> torch.Tensor:
        """Generate video from text."""
        
    def image_to_video(self, image: torch.Tensor, prompt: str, num_frames: int) -> torch.Tensor:
        """Generate video from image."""
        
    def video_continuation(self, video: torch.Tensor, prompt: str, num_frames: int) -> torch.Tensor:
        """Extend video with continuation."""
```

#### SHARP Backend
```python
class SHARPBackend:
    def __init__(self, checkpoint_path: str):
        """Load SHARP model weights."""
        
    def image_to_3d(self, image: np.ndarray) -> GaussianSplat:
        """Convert 2D image to 3D Gaussian splat."""
        
    def render_camera_path(
        self,
        splat: GaussianSplat,
        camera_path: List[CameraKeyframe],
        fps: int
    ) -> np.ndarray:
        """Render video from camera path through 3D scene."""
```

**Dependencies**: torch, torchvision, diffusers, transformers, gsplat

### 5. Video Compositor Component

**Purpose**: Assembles final music video from generated clips.

**Interface**:
```python
class VideoCompositor:
    def __init__(self):
        """Initialize video compositor."""
        
    def concatenate_clips(
        self,
        clip_paths: List[str],
        transition_type: str = "cut"
    ) -> str:
        """Concatenate video clips with transitions."""
        
    def synchronize_audio(
        self,
        video_path: str,
        audio_path: str
    ) -> str:
        """Sync video with audio, trim/extend as needed."""
        
    def apply_transitions(
        self,
        clip1_path: str,
        clip2_path: str,
        transition_duration: float,
        transition_type: str
    ) -> str:
        """Apply transition between two clips."""
        
    def normalize_clips(
        self,
        clip_paths: List[str],
        target_resolution: Tuple[int, int],
        target_fps: int
    ) -> List[str]:
        """Ensure all clips have consistent resolution and frame rate."""
        
    def export_final_video(
        self,
        video_path: str,
        output_path: str,
        codec: str = "libx264",
        quality: str = "high"
    ) -> str:
        """Export final video with specified codec and quality."""
```

**Transition Types**:
- `cut`: Instant cut (no transition)
- `fade`: Cross-fade between clips
- `dissolve`: Gradual dissolve
- `wipe`: Directional wipe
- `beat_sync`: Transition timed to beat

**Dependencies**: ffmpeg-python, moviepy

### 6. Project Manager Component

**Purpose**: Manages project state, storyboards, and generated assets.

**Interface**:
```python
class ProjectManager:
    def __init__(self, project_dir: str):
        """Initialize with project directory."""
        
    def create_project(self, audio_path: str, project_name: str) -> Project:
        """Create new project with audio file."""
        
    def save_storyboard(self, storyboard: Storyboard) -> None:
        """Save storyboard to project directory."""
        
    def load_storyboard(self) -> Storyboard:
        """Load storyboard from project directory."""
        
    def save_generated_clip(self, scene_id: int, clip_path: str) -> None:
        """Save generated clip to project."""
        
    def get_project_status(self) -> ProjectStatus:
        """Get current project status and progress."""
        
    def cleanup_project(self, keep_final_video: bool = True) -> None:
        """Clean up intermediate files."""
```

## Data Models

### Storyboard Structure

```python
@dataclass
class CutPoint:
    timestamp: float
    confidence: float
    beat_strength: float
    section: str  # intro, verse, chorus, bridge, outro

@dataclass
class SceneDescription:
    id: int
    start_time: float
    end_time: float
    duration: float
    description: str
    character_action: str
    camera_angle: str
    lighting: str
    environment: str
    video_prompt: str
    character_descriptor: Optional[CharacterDescriptor]
    reference_image: Optional[str]
    generated_video_path: Optional[str]

@dataclass
class Storyboard:
    project_name: str
    audio_file: str
    audio_duration: float
    global_style: str
    theme: Optional[str]
    scenes: List[SceneDescription]
    fps: int
    resolution: Tuple[int, int]
    model: str  # "longcat", "hunyuan", "sharp"
    
    def to_json(self) -> str:
        """Serialize to JSON."""
        
    @classmethod
    def from_json(cls, json_str: str) -> 'Storyboard':
        """Deserialize from JSON."""
```

### Camera Path Structure (for SHARP mode)

```python
@dataclass
class CameraKeyframe:
    timestamp: float
    position: Tuple[float, float, float]  # x, y, z
    rotation: Tuple[float, float, float]  # pitch, yaw, roll
    fov: float  # field of view in degrees

@dataclass
class CameraPath:
    keyframes: List[CameraKeyframe]
    interpolation: str  # "linear", "bezier", "catmull-rom"
    
    def interpolate(self, timestamp: float) -> CameraKeyframe:
        """Interpolate camera position at given timestamp."""
```

### Project Status

```python
@dataclass
class ProjectStatus:
    project_name: str
    audio_file: str
    created_at: datetime
    last_modified: datetime
    total_scenes: int
    scenes_generated: int
    current_step: str  # "analysis", "planning", "generation", "assembly", "complete"
    progress_percent: float
    estimated_time_remaining: Optional[float]
    errors: List[str]
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Audio Analysis Output Validity

*For any* valid audio file, the Audio_Analyzer should produce cut points where all timestamps are within the audio duration, all confidence scores are between 0 and 1, consecutive beats respect the minimum interval constraint, and all section labels are from the valid set (intro, verse, chorus, bridge, outro).

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Audio Loading Robustness

*For any* valid audio file format (MP3, WAV, FLAC, OGG), the Audio_Analyzer should successfully load and process the file without errors, returning a valid waveform and sample rate.

**Validates: Requirements 1.1**

### Property 3: Error Handling for Invalid Audio

*For any* corrupted or invalid audio data, the Audio_Analyzer should return a descriptive error message rather than crashing or hanging.

**Validates: Requirements 1.6**

### Property 4: Scene Description Completeness

*For any* generated scene description, it should contain all required fields: description, character_action, camera_angle, lighting, and environment.

**Validates: Requirements 2.5**

### Property 5: Global Style Consistency

*For any* user-specified global style and any set of generated scene descriptions, all descriptions should contain or reference the specified style.

**Validates: Requirements 2.4**

### Property 6: Character Extraction and Injection

*For any* first scene prompt containing character information, the Character_Manager should successfully extract the character descriptor, and for any subsequent scene prompt, the injected prompt should contain the extracted character description.

**Validates: Requirements 3.1, 3.2, 3.4**

### Property 7: Video Continuation Frame Extraction

*For any* video clip, the Character_Manager should be able to extract the last frame and use it as a reference for the next clip generation.

**Validates: Requirements 3.3**

### Property 8: Multiple Character Distinctness

*For any* set of multiple characters, each character should maintain distinct attributes across all scenes, and no two characters should have identical descriptors.

**Validates: Requirements 3.5**

### Property 9: Video Generation Functionality

*For any* valid text prompt or image input, the Video_Generator should successfully generate a video file using at least one of the supported models (LongCat-Video, HunyuanVideo, or SHARP).

**Validates: Requirements 4.1, 4.2, 4.3, 4.5**

### Property 10: Storyboard JSON Validity

*For any* completed audio analysis, the generated storyboard JSON should be valid JSON with all required fields (project_name, audio_file, scenes array), and each scene should have valid timestamps and metadata.

**Validates: Requirements 5.1**

### Property 11: Storyboard Validation

*For any* user-edited storyboard JSON, the system should validate the structure and reject invalid JSON with a descriptive error message before proceeding to generation.

**Validates: Requirements 5.3**

### Property 12: Metadata Preservation During Edits

*For any* storyboard edit that modifies scene descriptions, the timestamps (start_time, end_time) and scene IDs should remain unchanged.

**Validates: Requirements 5.4**

### Property 13: Custom Image Support

*For any* valid image file path added to a scene, the Video_Generator should use that image for image-to-video generation instead of generating from text.

**Validates: Requirements 5.5**

### Property 14: Action Sequence Decomposition

*For any* action description, the Scene_Planner should generate at least 2 connected shot prompts that together describe the complete action.

**Validates: Requirements 6.1**

### Property 15: Camera Angle Injection

*For any* user-specified camera angle, the generated scene prompt should contain the camera angle instruction.

**Validates: Requirements 6.3**

### Property 16: SHARP Camera Path Generation

*For any* 3D scene in SHARP mode, the system should generate a valid camera path with at least 2 keyframes, where each keyframe has valid position, rotation, and FOV values.

**Validates: Requirements 6.4**

### Property 17: Video Clip Ordering

*For any* list of generated video clips, the Video_Compositor should concatenate them in the exact order specified by the storyboard scene IDs.

**Validates: Requirements 7.1**

### Property 18: Audio-Video Duration Synchronization

*For any* audio file and set of generated video clips, the final assembled video duration should equal the audio duration (within 0.1 seconds tolerance).

**Validates: Requirements 7.2, 7.5, 7.6**

### Property 19: Resolution and Frame Rate Consistency

*For any* set of video clips with different resolutions or frame rates, the Video_Compositor should normalize them so the final video has consistent resolution and FPS throughout.

**Validates: Requirements 7.4**

### Property 20: Output Format Compliance

*For any* completed video assembly, the exported file should be a valid MP4 file with H.264 codec that can be played by standard video players.

**Validates: Requirements 7.7**

### Property 21: API Rate Limit Compliance

*For any* sequence of API calls to OpenRouter or HuggingFace, the system should track call counts and stay within the documented free tier limits, or handle rate limit errors gracefully.

**Validates: Requirements 10.2**

### Property 22: Content Caching

*For any* previously generated content (scene description, video clip), if the same inputs are provided again, the system should reuse the cached content instead of regenerating.

**Validates: Requirements 10.5**

### Property 23: Configuration Option Support

*For any* supported configuration option (resolution, FPS, aspect ratio, codec, quality preset), the system should accept the option and apply it to the final video output.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

### Property 24: Project Persistence Round-Trip

*For any* created project with storyboard and configuration, saving and then loading the project should restore all data exactly, allowing continuation from any step.

**Validates: Requirements 12.1, 12.2**

### Property 25: Style Variation Preservation

*For any* project, generating a variation with a different style should preserve all scene timings (start_time, end_time, duration) from the original.

**Validates: Requirements 12.3**

### Property 26: Selective Scene Regeneration

*For any* project with multiple scenes, regenerating a single scene should not modify the video files or metadata of other scenes.

**Validates: Requirements 12.4**

### Property 27: Project Listing Completeness

*For any* set of saved projects in the projects directory, the project list should include all projects with their metadata (audio file, creation date, status).

**Validates: Requirements 12.5**

### Property 28: Project Deletion Cleanup

*For any* project, deleting it should remove all associated files (storyboard, generated clips, final video) from the filesystem.

**Validates: Requirements 12.6**

### Property 29: Error Message Descriptiveness

*For any* error condition (invalid input, API failure, model error), the system should produce an error message that describes the problem and suggests a solution.

**Validates: Requirements 9.3**

## Error Handling

### Error Categories

1. **Input Validation Errors**
   - Invalid audio file format
   - Corrupted audio data
   - Invalid storyboard JSON
   - Missing required fields

2. **API Errors**
   - OpenRouter API unavailable
   - HuggingFace API rate limit exceeded
   - Authentication failures (missing/invalid API keys)
   - Network timeouts

3. **Model Errors**
   - Model weights not found
   - Insufficient GPU memory
   - Model inference failures
   - Unsupported input dimensions

4. **File System Errors**
   - Insufficient disk space
   - Permission denied
   - File not found
   - Path too long

5. **Video Processing Errors**
   - FFmpeg errors
   - Codec not supported
   - Invalid video dimensions
   - Audio-video sync failures

### Error Handling Strategy

```python
class ErrorHandler:
    def handle_error(self, error: Exception, context: Dict[str, Any]) -> ErrorResponse:
        """
        Central error handling with context-aware responses.
        
        Returns:
            ErrorResponse with user-friendly message and suggested actions
        """
        if isinstance(error, AudioLoadError):
            return ErrorResponse(
                message="Failed to load audio file. Please ensure the file is a valid audio format (MP3, WAV, FLAC, OGG).",
                suggestion="Try converting your audio file to MP3 format using an audio converter.",
                recoverable=True
            )
        elif isinstance(error, APIRateLimitError):
            return ErrorResponse(
                message=f"API rate limit exceeded for {error.service}. Free tier limit: {error.limit} requests per {error.period}.",
                suggestion=f"Please wait {error.retry_after} seconds before retrying, or consider using local GPU inference.",
                recoverable=True,
                retry_after=error.retry_after
            )
        elif isinstance(error, InsufficientGPUMemoryError):
            return ErrorResponse(
                message=f"Insufficient GPU memory. Required: {error.required_gb}GB, Available: {error.available_gb}GB.",
                suggestion="Try reducing resolution, using a smaller model, or switching to SHARP mode which uses less memory.",
                recoverable=True
            )
        # ... more error types
```

### Fallback Mechanisms

1. **Model Fallback Chain**
   ```
   LongCat-Video → HunyuanVideo → SHARP → Static Images
   ```

2. **API Fallback**
   ```
   OpenRouter (Gemini) → Template-based descriptions
   HuggingFace API → Local model inference
   ```

3. **Quality Degradation**
   - If 1080p fails, try 720p
   - If 60fps fails, try 30fps
   - If full-length video fails, generate shorter clips

## Testing Strategy

### Dual Testing Approach

The system will be validated using both **unit tests** and **property-based tests**:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary for comprehensive coverage

### Unit Testing

Unit tests will focus on:
- Specific examples that demonstrate correct behavior
- Integration points between components
- Edge cases (empty audio, single beat, very long audio)
- Error conditions (invalid files, API failures)

**Example Unit Tests**:
```python
def test_audio_analyzer_loads_mp3():
    """Test that AudioAnalyzer can load a standard MP3 file."""
    analyzer = AudioAnalyzer("test_audio.mp3")
    waveform, sr = analyzer.load_audio()
    assert waveform is not None
    assert sr == 44100

def test_scene_planner_fallback_on_api_failure():
    """Test that ScenePlanner falls back to templates when API fails."""
    planner = ScenePlanner(api_key="invalid_key")
    scenes = planner.generate_scene_descriptions(cut_points, audio_features)
    assert len(scenes) == len(cut_points)
    assert all(scene.description for scene in scenes)

def test_video_compositor_handles_duration_mismatch():
    """Test that compositor extends video when audio is longer."""
    compositor = VideoCompositor()
    result = compositor.synchronize_audio("short_video.mp4", "long_audio.mp3")
    video_duration = get_video_duration(result)
    audio_duration = get_audio_duration("long_audio.mp3")
    assert abs(video_duration - audio_duration) < 0.1
```

### Property-Based Testing

Property tests will use **Hypothesis** (Python) to verify universal properties across randomly generated inputs.

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `# Feature: ai-music-video-generator, Property N: [property text]`

**Example Property Tests**:

```python
from hypothesis import given, strategies as st
import hypothesis

# Feature: ai-music-video-generator, Property 1: Audio Analysis Output Validity
@given(
    audio_duration=st.floats(min_value=10.0, max_value=300.0),
    min_interval=st.floats(min_value=2.0, max_value=10.0)
)
@hypothesis.settings(max_examples=100)
def test_property_audio_analysis_output_validity(audio_duration, min_interval):
    """
    For any valid audio file, cut points should have valid timestamps,
    confidence scores, and respect minimum interval.
    """
    # Generate synthetic audio
    audio = generate_synthetic_audio(duration=audio_duration)
    analyzer = AudioAnalyzer(audio)
    analyzer.load_audio()
    
    cut_points = analyzer.detect_beats(min_interval=min_interval)
    
    # Property: All timestamps within audio duration
    assert all(0 <= cp.timestamp <= audio_duration for cp in cut_points)
    
    # Property: All confidence scores in [0, 1]
    assert all(0 <= cp.confidence <= 1 for cp in cut_points)
    
    # Property: Consecutive beats respect minimum interval
    for i in range(len(cut_points) - 1):
        assert cut_points[i+1].timestamp - cut_points[i].timestamp >= min_interval
    
    # Property: All section labels are valid
    valid_sections = {"intro", "verse", "chorus", "bridge", "outro"}
    assert all(cp.section in valid_sections for cp in cut_points)

# Feature: ai-music-video-generator, Property 6: Character Extraction and Injection
@given(
    character_name=st.text(min_size=3, max_size=20, alphabet=st.characters(whitelist_categories=('Lu', 'Ll'))),
    character_appearance=st.text(min_size=10, max_size=100),
    num_scenes=st.integers(min_value=2, max_value=10)
)
@hypothesis.settings(max_examples=100)
def test_property_character_extraction_and_injection(character_name, character_appearance, num_scenes):
    """
    For any character description, it should be extracted from the first scene
    and injected into all subsequent scenes.
    """
    first_prompt = f"A scene with {character_name}, {character_appearance}, standing in a field"
    
    manager = CharacterManager()
    character = manager.extract_character_description(first_prompt)
    
    # Property: Character descriptor should contain the appearance
    assert character_appearance.lower() in character.appearance.lower() or \
           character_name.lower() in character.appearance.lower()
    
    # Property: Character should be injected into all subsequent prompts
    for i in range(num_scenes - 1):
        scene_prompt = f"Scene {i+2}: A different location"
        injected_prompt = manager.inject_character(scene_prompt, character)
        
        # Character appearance should be in the injected prompt
        assert character.appearance.lower() in injected_prompt.lower()

# Feature: ai-music-video-generator, Property 18: Audio-Video Duration Synchronization
@given(
    audio_duration=st.floats(min_value=30.0, max_value=180.0),
    num_clips=st.integers(min_value=3, max_value=15)
)
@hypothesis.settings(max_examples=100)
def test_property_audio_video_duration_sync(audio_duration, num_clips):
    """
    For any audio and set of video clips, the final video duration
    should match the audio duration.
    """
    # Generate synthetic audio and video clips
    audio_path = generate_synthetic_audio(duration=audio_duration)
    clip_durations = distribute_duration(audio_duration, num_clips)
    clip_paths = [generate_synthetic_video(duration=d) for d in clip_durations]
    
    compositor = VideoCompositor()
    final_video = compositor.concatenate_clips(clip_paths)
    final_video = compositor.synchronize_audio(final_video, audio_path)
    
    # Property: Final video duration should equal audio duration (within tolerance)
    video_duration = get_video_duration(final_video)
    assert abs(video_duration - audio_duration) < 0.1

# Feature: ai-music-video-generator, Property 24: Project Persistence Round-Trip
@given(
    project_name=st.text(min_size=5, max_size=30, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))),
    num_scenes=st.integers(min_value=3, max_value=20),
    resolution=st.sampled_from([(1280, 720), (1920, 1080), (3840, 2160)]),
    fps=st.sampled_from([24, 30, 60])
)
@hypothesis.settings(max_examples=100)
def test_property_project_persistence_round_trip(project_name, num_scenes, resolution, fps):
    """
    For any project, saving and loading should restore all data exactly.
    """
    # Create project with random data
    project_manager = ProjectManager(f"test_projects/{project_name}")
    
    original_storyboard = Storyboard(
        project_name=project_name,
        audio_file="test_audio.mp3",
        audio_duration=120.0,
        global_style="cinematic",
        theme="adventure",
        scenes=[create_random_scene(i) for i in range(num_scenes)],
        fps=fps,
        resolution=resolution,
        model="longcat"
    )
    
    # Save project
    project_manager.save_storyboard(original_storyboard)
    
    # Load project
    loaded_storyboard = project_manager.load_storyboard()
    
    # Property: All data should be identical
    assert loaded_storyboard.project_name == original_storyboard.project_name
    assert loaded_storyboard.audio_file == original_storyboard.audio_file
    assert loaded_storyboard.audio_duration == original_storyboard.audio_duration
    assert loaded_storyboard.global_style == original_storyboard.global_style
    assert loaded_storyboard.fps == original_storyboard.fps
    assert loaded_storyboard.resolution == original_storyboard.resolution
    assert len(loaded_storyboard.scenes) == len(original_storyboard.scenes)
    
    for orig_scene, loaded_scene in zip(original_storyboard.scenes, loaded_storyboard.scenes):
        assert loaded_scene.id == orig_scene.id
        assert loaded_scene.start_time == orig_scene.start_time
        assert loaded_scene.end_time == orig_scene.end_time
        assert loaded_scene.description == orig_scene.description
```

### Test Coverage Goals

- **Unit test coverage**: 80%+ of code lines
- **Property test coverage**: 100% of correctness properties
- **Integration test coverage**: All major workflows (audio → storyboard → video → final output)
- **Error handling coverage**: All error types and fallback mechanisms

### Testing Infrastructure

**Test Data Generation**:
```python
def generate_synthetic_audio(duration: float, sr: int = 44100) -> str:
    """Generate synthetic audio with beats for testing."""
    
def generate_synthetic_video(duration: float, resolution: Tuple[int, int] = (1920, 1080)) -> str:
    """Generate synthetic video clip for testing."""
    
def create_random_scene(scene_id: int) -> SceneDescription:
    """Create a random scene description for testing."""
```

**Test Fixtures**:
- Sample audio files (various formats, durations)
- Sample video clips (various resolutions, codecs)
- Mock API responses (OpenRouter, HuggingFace)
- Pre-generated storyboards

### Continuous Integration

Tests will run on:
- Every commit (unit tests + fast property tests)
- Pull requests (full test suite)
- Nightly builds (extended property tests with 1000+ iterations)

## Implementation Notes

### Technology Stack

**Core Dependencies**:
- Python 3.10+
- PyTorch 2.0+
- librosa 0.10+
- gradio 4.0+
- ffmpeg-python
- moviepy
- hypothesis (for property testing)

**AI Models**:
- LongCat-Video (MIT license)
- HunyuanVideo (Tencent license - check restrictions)
- SHARP (Apple, open source)
- Stable Diffusion XL (for image generation)

**APIs**:
- OpenRouter (free tier: Gemini 2.0 Flash)
- HuggingFace Inference API (free tier with rate limits)

### Performance Considerations

**Audio Analysis**: Fast (CPU-bound, <5 seconds for 3-minute song)

**Scene Planning**: Moderate (API-bound, ~1-2 seconds per scene)

**Video Generation**: Slow (GPU-bound)
- LongCat-Video: ~30-60 seconds per 5-second clip on RTX 4090
- SHARP: ~1 second for 2D→3D, ~10 seconds for rendering
- Colab free tier: 2-3x slower than local GPU

**Video Assembly**: Fast (CPU-bound, <10 seconds for 3-minute video)

**Total Pipeline**: 10-30 minutes for a 3-minute music video (depending on GPU)

### Deployment Strategy

**Phase 1: HuggingFace Spaces (MVP)**
- Gradio UI for audio upload and storyboard editing
- Audio analysis on CPU
- Scene planning via OpenRouter API
- Video generation offloaded to user's Colab notebook
- Manual download and upload of generated clips

**Phase 2: Integrated Colab Backend**
- Automated API between HF Spaces and Colab
- User provides Colab notebook URL
- System automatically triggers video generation
- Results returned to HF Spaces

**Phase 3: Local GPU Support**
- Desktop application or local web server
- All processing on user's machine
- No cloud dependencies
- Faster processing for users with GPUs

### Cost Optimization

**Free Tier Limits**:
- OpenRouter (Gemini 2.0 Flash): ~10,000 requests/day
- HuggingFace Inference API: ~1,000 requests/day
- Google Colab Free: 12-15 GPU hours/day

**Strategies**:
1. Cache all LLM-generated prompts
2. Reuse generated clips when possible
3. Batch API requests
4. Prefer local inference when GPU available
5. Use SHARP mode for lower GPU memory usage

**Estimated Costs** (per 3-minute video):
- Free tier: $0 (within limits)
- Paid APIs: $0.50-2.00 (if free tier exceeded)
- Local GPU: $0 (electricity only)

## Future Enhancements

1. **Real-time Preview**: Generate low-res preview before full generation
2. **Style Transfer**: Apply artistic styles to generated videos
3. **Lip Sync**: Sync character mouth movements to lyrics
4. **Multi-language Support**: Generate videos for songs in different languages
5. **Collaborative Editing**: Multiple users editing same storyboard
6. **Template Library**: Pre-made storyboard templates for different genres
7. **Advanced Camera Control**: Bezier curve camera paths, focus pulling
8. **Character LoRA Training**: Train custom LoRA for perfect character consistency
9. **Audio Reactivity**: Video effects that react to audio frequency/amplitude
10. **Export Formats**: Support for more formats (WebM, AV1, ProRes)
