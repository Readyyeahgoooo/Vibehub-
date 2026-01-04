# Requirements Document

## Introduction

VibeFrame 2.0 is an AI-powered music video generation system that transforms audio files into visually consistent, professionally edited music videos. The system analyzes audio to detect beats, drums, and transitions, then generates coherent video sequences with consistent characters, styles, and camera movements synchronized to the music. The system leverages free and open-source AI models (LongCat-Video, HunyuanVideo, SHARP) alongside cloud APIs (OpenRouter, HuggingFace) to create production-quality music videos at zero or minimal cost.

## Glossary

- **System**: The VibeFrame 2.0 music video generation application
- **Audio_Analyzer**: Component that processes audio files to detect beats, drums, and musical structure
- **Scene_Planner**: Component that generates scene descriptions and timing based on audio analysis
- **Video_Generator**: Component that creates video clips from text/image prompts using AI models
- **Character_Manager**: Component that maintains character consistency across video scenes
- **Video_Compositor**: Component that assembles, transitions, and synchronizes final video output
- **Storyboard**: JSON structure containing scene timings, descriptions, prompts, and metadata
- **Beat**: Rhythmic pulse in music detected by audio analysis
- **Cut_Point**: Timestamp where a scene transition should occur
- **Continuation_Prompt**: Instruction to extend a video clip while maintaining visual consistency
- **LongCat_Video**: Open-source MIT-licensed video generation model supporting T2V, I2V, and video continuation
- **SHARP**: Apple's open-source model for converting 2D images to 3D Gaussian splats
- **OpenRouter**: API service providing access to free LLM models (Gemini, etc.)
- **HuggingFace_API**: API service for accessing AI models including image and video generation

## Requirements

### Requirement 1: Audio Analysis and Beat Detection

**User Story:** As a user, I want the system to analyze my audio file and automatically detect beats, drums, and optimal cut points, so that the generated video is synchronized with the music's rhythm and structure.

#### Acceptance Criteria

1. WHEN a user uploads an audio file, THE Audio_Analyzer SHALL load and process the audio using librosa
2. WHEN analyzing audio, THE Audio_Analyzer SHALL detect beat timestamps with configurable minimum interval between cuts
3. WHEN analyzing audio, THE Audio_Analyzer SHALL detect drum hits and percussion events using onset strength detection
4. WHEN analyzing audio, THE Audio_Analyzer SHALL identify musical sections (intro, verse, chorus, bridge, outro) using structural segmentation
5. WHEN analysis is complete, THE Audio_Analyzer SHALL generate a list of cut points with timestamps and confidence scores
6. WHEN the audio file is invalid or corrupted, THE Audio_Analyzer SHALL return a descriptive error message

### Requirement 2: Intelligent Scene Planning

**User Story:** As a user, I want the system to automatically generate creative scene descriptions that match the mood and structure of my music, so that I don't have to manually write prompts for every scene.

#### Acceptance Criteria

1. WHEN cut points are detected, THE Scene_Planner SHALL generate scene descriptions using OpenRouter's free LLM API
2. WHEN generating descriptions, THE Scene_Planner SHALL analyze audio features (tempo, energy, mood) to inform scene content
3. WHEN generating descriptions, THE Scene_Planner SHALL maintain narrative coherence across consecutive scenes
4. WHEN a user provides a global style or theme, THE Scene_Planner SHALL incorporate it into all scene descriptions
5. WHEN generating descriptions, THE Scene_Planner SHALL create detailed prompts including character appearance, actions, camera angles, and lighting
6. WHEN the LLM API is unavailable, THE Scene_Planner SHALL fall back to template-based descriptions

### Requirement 3: Character Consistency Management

**User Story:** As a user, I want the same character to appear consistently throughout the music video, so that the video has visual coherence and tells a cohesive story.

#### Acceptance Criteria

1. WHEN generating the first scene, THE Character_Manager SHALL extract and store character description from the initial prompt
2. WHEN generating subsequent scenes, THE Character_Manager SHALL inject the stored character description into each prompt
3. WHEN using video continuation, THE Character_Manager SHALL pass the last frame of the previous clip as reference
4. WHEN a user specifies character attributes, THE Character_Manager SHALL enforce those attributes across all scenes
5. WHEN generating scenes, THE Character_Manager SHALL support multiple characters with distinct, consistent appearances
6. WHEN character consistency fails, THE Character_Manager SHALL log the failure and attempt regeneration with stronger constraints

### Requirement 4: Video Generation with Multiple Model Support

**User Story:** As a user, I want the system to generate high-quality video clips using free AI models, so that I can create professional music videos without expensive API costs.

#### Acceptance Criteria

1. WHEN generating video, THE Video_Generator SHALL support LongCat-Video for text-to-video generation
2. WHEN generating video, THE Video_Generator SHALL support LongCat-Video for image-to-video generation
3. WHEN generating video, THE Video_Generator SHALL support video continuation to extend clips seamlessly
4. WHEN generating video, THE Video_Generator SHALL support HunyuanVideo as an alternative model
5. WHEN generating video, THE Video_Generator SHALL support SHARP for 2D-to-3D conversion with camera animation
6. WHEN a model fails, THE Video_Generator SHALL attempt fallback to alternative models
7. WHEN running locally, THE Video_Generator SHALL detect available GPU and optimize settings accordingly
8. WHEN running on Colab, THE Video_Generator SHALL configure for cloud GPU environment

### Requirement 5: Storyboard Editing and Customization

**User Story:** As a user, I want to review and edit the automatically generated storyboard before video generation, so that I can customize scenes, adjust timing, and refine prompts.

#### Acceptance Criteria

1. WHEN audio analysis completes, THE System SHALL generate a storyboard JSON file with all scene metadata
2. WHEN displaying the storyboard, THE System SHALL present it in an editable format (JSON editor or UI form)
3. WHEN a user edits the storyboard, THE System SHALL validate the JSON structure before proceeding
4. WHEN a user modifies scene descriptions, THE System SHALL preserve timing and metadata
5. WHEN a user adds custom image references, THE System SHALL support image-to-video generation for those scenes
6. WHEN a user requests automatic mode, THE System SHALL skip the editing step and proceed directly to generation

### Requirement 6: Action Choreography and Camera Control

**User Story:** As a user, I want to specify multi-shot action sequences with camera movements, so that I can create dynamic scenes like a character throwing a ball or dancing.

#### Acceptance Criteria

1. WHEN a user specifies an action sequence, THE Scene_Planner SHALL break it into multiple connected shots
2. WHEN generating action sequences, THE Video_Generator SHALL use video continuation to maintain motion coherence
3. WHEN a user specifies camera angles, THE Scene_Planner SHALL include camera instructions in prompts
4. WHEN using SHARP mode, THE System SHALL generate programmatic camera paths through 3D scenes
5. WHEN generating camera movements, THE System SHALL support pan, tilt, zoom, and dolly movements
6. WHEN action sequences span multiple scenes, THE Character_Manager SHALL maintain character pose continuity

### Requirement 7: Video Assembly and Synchronization

**User Story:** As a user, I want the system to automatically assemble all generated clips into a final music video with smooth transitions and perfect audio sync, so that I receive a polished, ready-to-share video.

#### Acceptance Criteria

1. WHEN all clips are generated, THE Video_Compositor SHALL concatenate them in storyboard order
2. WHEN assembling video, THE Video_Compositor SHALL synchronize video duration exactly with audio duration
3. WHEN assembling video, THE Video_Compositor SHALL apply transitions between scenes based on music intensity
4. WHEN assembling video, THE Video_Compositor SHALL ensure consistent resolution and frame rate across all clips
5. WHEN audio is longer than video, THE Video_Compositor SHALL extend the final scene or loop content
6. WHEN video is longer than audio, THE Video_Compositor SHALL trim excess video content
7. WHEN assembly is complete, THE Video_Compositor SHALL export the final video in MP4 format with H.264 codec

### Requirement 8: Deployment and API Integration

**User Story:** As a user, I want to access the system through a web interface and have it work with free cloud resources, so that I don't need expensive local hardware.

#### Acceptance Criteria

1. WHEN deployed, THE System SHALL provide a Gradio web interface for user interaction
2. WHEN deployed on HuggingFace Spaces, THE System SHALL handle audio analysis and scene planning on CPU
3. WHEN video generation is required, THE System SHALL support offloading to Google Colab via API
4. WHEN using OpenRouter API, THE System SHALL use free models (Gemini 2.0 Flash) for prompt enhancement
5. WHEN using HuggingFace API, THE System SHALL respect rate limits and handle quota errors gracefully
6. WHEN API keys are missing, THE System SHALL provide clear instructions for obtaining them
7. WHEN running in local mode, THE System SHALL detect and utilize available GPU resources

### Requirement 9: Progress Tracking and Error Handling

**User Story:** As a user, I want to see real-time progress updates during video generation and receive clear error messages if something fails, so that I understand what the system is doing and can troubleshoot issues.

#### Acceptance Criteria

1. WHEN processing begins, THE System SHALL display progress indicators for each major step
2. WHEN generating multiple clips, THE System SHALL show per-clip progress (e.g., "Generating scene 3 of 12")
3. WHEN an error occurs, THE System SHALL display a user-friendly error message with suggested solutions
4. WHEN API rate limits are hit, THE System SHALL inform the user and suggest retry timing
5. WHEN generation is slow, THE System SHALL provide estimated time remaining
6. WHEN processing completes, THE System SHALL display a success message with download link

### Requirement 10: Cost Optimization and Free Tier Management

**User Story:** As a user, I want the system to minimize or eliminate costs by intelligently using free tiers and open-source models, so that I can create music videos without spending money.

#### Acceptance Criteria

1. WHEN selecting models, THE System SHALL prioritize free and open-source options (LongCat-Video, Open-Sora)
2. WHEN using cloud APIs, THE System SHALL stay within free tier limits of OpenRouter and HuggingFace
3. WHEN free tier limits are reached, THE System SHALL notify the user and suggest alternatives
4. WHEN running on Colab free tier, THE System SHALL optimize for 12-hour session limits
5. WHEN possible, THE System SHALL cache generated content to avoid redundant API calls
6. WHEN a user has local GPU, THE System SHALL prefer local inference over cloud APIs

### Requirement 11: Output Quality and Format Options

**User Story:** As a user, I want to configure output quality, resolution, and format options, so that I can optimize for different platforms (YouTube, Instagram, TikTok).

#### Acceptance Criteria

1. WHEN configuring output, THE System SHALL support resolution options (720p, 1080p, 4K)
2. WHEN configuring output, THE System SHALL support frame rate options (24fps, 30fps, 60fps)
3. WHEN configuring output, THE System SHALL support aspect ratio options (16:9, 9:16, 1:1)
4. WHEN exporting video, THE System SHALL support codec options (H.264, H.265, VP9)
5. WHEN exporting video, THE System SHALL support quality presets (draft, standard, high, maximum)
6. WHEN platform is specified, THE System SHALL apply platform-specific optimizations (YouTube, Instagram, TikTok)

### Requirement 12: Batch Processing and Project Management

**User Story:** As a user, I want to save my projects and generate multiple variations of the same music video, so that I can experiment with different styles and iterate on my creative vision.

#### Acceptance Criteria

1. WHEN a project is created, THE System SHALL save all configuration and storyboard data to a project directory
2. WHEN resuming a project, THE System SHALL load previous storyboard and allow continuation from any step
3. WHEN generating variations, THE System SHALL support changing style while keeping the same timing
4. WHEN generating variations, THE System SHALL support regenerating individual scenes without affecting others
5. WHEN managing projects, THE System SHALL list all saved projects with metadata (audio file, creation date, status)
6. WHEN deleting a project, THE System SHALL remove all associated files and generated content
