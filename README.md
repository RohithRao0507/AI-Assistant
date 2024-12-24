# AI Assistant

This is a web-based AI Assistant that allows users to interact with various functionalities like voice commands, text inputs, summarization, music playback, Telegram messaging, and web search. The application also provides a dynamic UI with dark/light mode toggling and animations for listening and speaking states.

<!-- ![AI Assistant Screenshot](screenshot.png) -->

## Features
- 🎤 **Voice Commands**: Speak directly to the assistant using your microphone.
- 📝 **Text Input**: Type commands into the input box for the assistant.
- 📜 **Summarization**: Automatically summarizes topics or web content and downloads a text file.
- 🎶 **Music Playback**: Plays music from Spotify when you say or type a song name.
- 💬 **Telegram Messaging**: Sends messages via Telegram using a bot.
- 🌐 **Web Search**: Opens the browser to search for your queries.
- 🎨 **Dynamic Animations**: Displays wave animations while listening and speaking dots while reading out responses.
- 🌙 **Dark/Light Mode**: Switch themes using the toggle button.

## Technologies Used
- **Frontend**: React.js
- **Backend**: Flask
- **APIs**:
  - OpenAI GPT API
  - Spotify Web API
  - Telegram Bot API
- **Speech Recognition**: Browser-based speech recognition
- **Text-to-Speech**: Browser-based text-to-speech

## Installation

Follow these steps to set up and run the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-assistant.git
cd ai-assistant
```

### 2. Install Backend Dependencies
Navigate to the backend directory and install the required Python dependencies:

```bash
Copy code
cd backend
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Create a .env file in the backend folder and add the following keys:

```plaintext
OPENAI_API_KEY=your_openai_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 4. Install Frontend Dependencies
Navigate to the frontend directory and install the required Node.js dependencies:

```bash
cd ../frontend
npm install

### Run the Application
# Start the Backend:

cd ../backend
python app.py

#Start the Frontend:
cd ../frontend
npm start
```