# Panel Image Generation Integration

This implementation allows users to generate panel images by sending contextual messages to the main manga chat layout from the panel form.

## How it works

1. **Panel Context Detection**: When a user clicks "Generate Image" in the panel form, the system automatically detects the context of the panel:

   - Chapter number and title
   - Scene order and title
   - Panel order within the scene

2. **Message Generation**: A descriptive message is generated that includes:

   - Panel position: "Generate panel X for Scene Y in chapter Z"
   - Chapter information: Chapter title
   - Panel description: If provided by the user

3. **Chat Integration**: The message is sent to the main chat layout where the AI can process it and generate the appropriate image.

## Example Messages

- Basic: "Generate panel 1 for Scene 1 in chapter 1 (The Beginning). Please create an image for this panel."
- With description: "Generate panel 2 for Opening Scene in chapter 1 (The Beginning). Panel description: A close-up of the protagonist's determined face."

## Components Modified

- **PanelForm**: Added chat message callback support
- **ImageSetup**: Enhanced UI with chat integration button
- **ManualPanelGeneration**: Passes chat callback to panel form
- **NewMangaChatLayout**: Provides message sending capability
- **Panel Context Utils**: Helper functions for context detection and message generation

## Usage

1. Open the panel form (create new or edit existing)
2. Switch to the "Image" tab
3. Click "Send to Main Chat for Generation"
4. The panel form closes and the message appears in the chat input
5. User can review/modify the message before sending to AI

This approach provides a seamless workflow where panel creation and image generation are integrated through the main chat interface.
