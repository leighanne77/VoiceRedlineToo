 **Note**: The Chrome extension component is currently under construction and will be available after January 15, 2024
# Real-Time Collaborative Document Markup Tool
@https://github.com/leighanne77/voice-redline 

This tool uses the Groq API and a Chrome Browser Extension, allowing you to mark up and change online documents - Google Documents and Microsoft Documents - in real-time using just your voice. The tool works paragraph-by-paragraph with the help of a pop up side panel, right in your browser. The tool responds to manual and voice-enabled commands, and makes suggestions in the pop up preview panel. The tool is multilingual.

## Prerequisites (not requirements, that is later)

- Python 3.8+
- Chrome browser (for extension)
- Groq API key

## A. Running the Application

For this version of the application, you will need to run the voice processing server and the main backend server. And you will need to activate and deactivate a virtual environment.

1. Clone the repository:
   ```bash
   git clone https://github.com/leighanne77/voice-redline-too.git
   cd voice-redline
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On Unix or MacOS
   source venv/bin/activate
   ```

3. a. Install dependencies 
   ```bash
   pip install -r requirements.txt
   ```
   b. copy the `.env.example` to `.env` AND add your Groq API key to the `.env` file - puttig your API Key where you see "your_api_key_here" [as in "GROQ_API_KEY=your_api_key_here"] 
   Best Practices:
   Always keep your API key secure
   Never commit it to version control, .env will be the right place to keep it secure and not committed to version control

   ```bash
   cp .env.example .env && echo "GROQ_API_KEY=your_api_key_here" > .env
OR
   vim .env
OR on Windows:
   notepad .env
 ```

4. Start the voice processing server:
   ```
   cd src
   python voice_processor.py
   ```

5. The voice processing server will start running on `ws://localhost:8765`

6. Start the main backend server:
   ```
   python main.py
   ```

7. Check this: The main server should start running on `http://localhost:8000`

8. Use the browser extension as described in the Usage section below. 

9. When done, exit or deactivate the virtual environment:
   ```
   deactivate
   ```  


## B. Usage - Chrome Extension

1. Start both the voice processing server and the main backend server as described in the "A. Running the Application" section.

2. Use the browser extension for collaborative document editing:
   - Open a document in Google Docs or Microsoft Office Online
   - Click on the extension icon in your browser
   - Grant necessary permissions for audio capture and document access
   - Move the cursor to where you need to start making changes
   - Use the following controls in the extension popup to start your collaborative editing session
Manual:
  - Start Redlining
  - Stop Redlining
  - Make New Suggestions
  - Accept Suggestion
  - Clear
  - Accept All
- Voice command detection and processing:
  - "start redlining"
  - "stop redlining"
  - "move cursor up"
  - "move cursor down"
  - "go forward"
  - "go forward two"
  - "move cursor to the words ____"
  - "make suggestion"
  - "Accept Suggested"
  - "Clear markup, restore original"
  - "Accept All, Move to Final"
- The tool will have visual highlighting of changes in the document
- And a preview panel for suggestions "Start" to begin capturing the conversation or use the voice command
     * As you and your collaborators discuss changes, the extension will:
       - Capture the conversation in real-time using WebSocket communication, but not transcribe until the "start redlining" command or manual commands are used
       - Analyze the entire document for relevant markup suggestions
       - Apply changes to the document in real-time whenever the "start redlining" or manual "start" button is ued
       - Keep original text after the new text, but with the font strikout
       - Highlight the new text, the changes, visually in the document
     * Click "Stop" to pause the audio capture or say "stop redlining"
     * Use the "Clear Changes" button to reset the current set of suggestions and highlights, or say "clear markup, restore original"
     * Click "Accept Changes" to finalize all the markup texts in the document, or say "Accept All, Move to Final"

     All changes will be logged and tracked in an appendix at the end of the document, even after "Accept Changes" is pressed or the words "Accept All, Move to Final" are said

## Development Commands - Devs Only, not for users

### NPM Scripts (JavaScript & Python)
- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run lint` - Check code style
- `npm run format` - Format code
- `npm run clean` - Clean cache files

### Make Commands (Translations)
- `make translations-setup` - Initialize translations
- `make translations-compile` - Compile translation files
- `make translations-update` - Update translation files

To Include:
- `requirements.txt`: List of Python dependencies
- `.env`: Configuration file for storing API keys (not tracked in git)


## Appendix: Edge Cases to Solve For

First Priority: 

### UI/UX
- Too many suggestions
- Very long suggestions
- Special formatting in suggestions
- Panel size constraints
- Display overflow
- Formatting preservation

### Voice Commands
- Background noise/unclear speech
- Multiple commands in one transcript
- Similar sounding commands
- Partial/incomplete commands
- Low confidence scores
- Ambiguous commands

### Real-time Synchronization
- Multiple users editing same paragraph
- Network interruptions
- Out-of-order updates
- Failed suggestions
- Conflicting edits
- Connection drops

Second Priority:

### Document Structure
- Empty paragraphs
- Cursor in lists/tables/special elements
- Cursor in comments or suggestions
- Nested content structures
- Missing editor element (when page is loading, unsupported document type, or DOM structure changes)
- No selection range found

### Content Processing
- Empty or whitespace-only text
- Text exceeding maximum length
- Special characters and formatting
- Multiple languages in one document
- Malformed paragraph structures
- Invalid text content

## Prerequisites

- Python 3.8+
- Chrome browser (for extension when available)
- Groq API key
- Node.js 14+ (for extension development)

Notes on Chrome Browsers and how the tool meets best practices

Single, Clear Purpose:

- The tool has one focused purpose: real-time document markup using voice commands
- All functionality (voice commands, preview panel, highlighting) directly serves this single purpose
- There are no unrelated features bundled together

Complementary Functionality:

- It enhances the existing document editing experience in Google Docs and Microsoft Documents
- Works within the user's natural document editing workflow
- Doesn't replace or interfere with standard document editing features

Minimal Distraction UI:

- Uses a side panel preview that doesn't obstruct the main document
- Visual highlighting is contained within the document's content
- Interface elements (start/stop controls) are simple and focused
- Changes are previewed before being applied, preventing disruption

Task Enhancement:

- Directly supports the user's current task (document editing)
- Voice commands align with natural editing actions
- Preview panel shows suggestions relevant to the current context
- Changes are tracked and logged systematically

The extension maintains a tight scope around document markup without venturing into unrelated features like general voice commands, document management, or other functionalities. This makes it compliant with Chrome's requirement for a narrow, well-defined purpose.

## Testing

This project uses pytest for testing. For detailed testing information, see [TESTING.md](TESTING.md).

### Quick Start
```bash
# Install test dependencies
pip install -r requirements-dev.txt

# Set up test environment
cp tests/.env.test.example tests/.env.test

# Run tests
make test              # All tests
make test-unit        # Unit tests only
make test-integration # Integration tests only
make coverage         # Generate coverage report
```# VoiceRedlineToo


