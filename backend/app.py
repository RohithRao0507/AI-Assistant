import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import webbrowser
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
import requests
import os
from flask import send_file
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Openai API Configuration
openai.api_key = os.getenv("OPENAI_API_KEY")

# Spotify API Configuration
spotify_client_id = os.getenv("SPOTIFY_CLIENT_ID")
spotify_client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIPY_REDIRECT_URI = "http://localhost:8888/callback"


#Telegram API configuration
telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = "7944316782"

spotify = Spotify(auth_manager=SpotifyOAuth(
    client_id=spotify_client_id,
    client_secret=spotify_client_secret,
    redirect_uri=SPOTIPY_REDIRECT_URI,
    scope="user-modify-playback-state user-read-playback-state"
))

logging.basicConfig(level=logging.DEBUG)

def handle_web_search(prompt):
    query = prompt.lower().replace("search the web for", "").replace("open browser and look for", "").strip()
    if query:
        search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
        webbrowser.open(search_url)
        return {"response": f"I've opened the browser to search for '{query}'."}
    return {"response": "Please provide a valid query to search."}

@app.route('/api/gpt', methods=['POST'])
def gpt_response():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        if not prompt:
            return jsonify({"response": "No input provided!"}), 400

        # Handle web search commands
        if "search the web for" in prompt.lower() or "open browser and look for" in prompt.lower():
            result = handle_web_search(prompt)
            return jsonify(result)

        # Default behavior for other prompts
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        reply = response['choices'][0]['message']['content']
        return jsonify({"response": reply})
    except Exception as e:
        logging.error(f"Error occurred: {e}")
        return jsonify({"response": f"Error: {str(e)}"}), 500

@app.route('/api/play-music', methods=['POST'])
def play_music():
    try:
        data = request.json
        song_name = data.get('song', '')
        if not song_name:
            return jsonify({"response": "No song name provided!"}), 400

        # Search for the song on Spotify
        results = spotify.search(q=song_name, type='track', limit=1)
        if results['tracks']['items']:
            track_uri = results['tracks']['items'][0]['uri']
            # Play the track
            devices = spotify.devices()
            if not devices['devices']:
                return jsonify({"response": "No active device found. Please open Spotify on a device."}), 400
            device_id = devices['devices'][0]['id']
            spotify.start_playback(device_id=device_id, uris=[track_uri])
            return jsonify({"response": f"Playing '{song_name}' on Spotify."})
        else:
            return jsonify({"response": f"Song '{song_name}' not found on Spotify."})
    except Exception as e:
        logging.error(f"Error occurred while playing music: {e}")
        return jsonify({"response": f"Error: {str(e)}"}), 500
    
@app.route('/test-spotify', methods=['GET'])
def test_spotify():
    try:
        # Get the current user's profile
        user = spotify.current_user()
        return jsonify({"response": f"Authenticated as {user['display_name']} ({user['id']})"})
    except Exception as e:
        logging.error(f"Spotify authentication error: {e}")
        return jsonify({"response": f"Error: {str(e)}"}), 500



# Telegram Bot Configuration


@app.route('/api/send-telegram', methods=['POST'])
def send_telegram_message():
    try:
        data = request.json
        message = data.get('message', '')
        if not message:
            return jsonify({"response": "No message provided!"}), 400

        # Send the message via Telegram API
        url = f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message
        }
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            return jsonify({"response": "Message sent successfully!"})
        else:
            return jsonify({"response": f"Failed to send message. Error: {response.json()}"}), 400
    except Exception as e:
        logging.error(f"Error occurred while sending Telegram message: {e}")
        return jsonify({"response": f"Error: {str(e)}"}), 500

@app.route('/api/summarize', methods=['POST'])
def summarize():
    try:
        data = request.json
        topic = data.get('topic', '')
        if not topic:
            return jsonify({"response": "No topic or URL provided!"}), 400

        # Call ChatGPT to generate a summary
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Summarize the given topic or website."},
                {"role": "user", "content": f"Summarize this: {topic}"}
            ]
        )

        summary = response['choices'][0]['message']['content']
        file_path = "summary.txt"

        # Write the summary to a text file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(summary)

        return send_file(file_path, as_attachment=True)
    except Exception as e:
        logging.error(f"Error occurred during summarization: {e}")
        return jsonify({"response": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
