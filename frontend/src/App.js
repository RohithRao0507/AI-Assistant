import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // Import the CSS file for styling
import aiLogo from "./ai-assistant-logo.png"; // Import your logo image

function App() {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [isRecording, setIsRecording] = useState(false); // Track if system is listening
    const [isSpeaking, setIsSpeaking] = useState(false); // Track if system is speaking
    const [darkMode, setDarkMode] = useState(false);
    const [error, setError] = useState("");

    const speakOutLoud = (text) => {
        if ("speechSynthesis" in window) {
            const speech = new SpeechSynthesisUtterance(text);
            speech.lang = "en-US";
            speech.rate = 1;
            speech.pitch = 1;

            // Set speaking state to true
            setIsSpeaking(true);

            // Handle when speech ends
            speech.onend = () => {
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(speech);
        } else {
            setError("Text-to-Speech is not supported in your browser.");
        }
    };

    const handleSubmit = async () => {
        if (!input.trim()) {
            setError("Please enter a query.");
            return;
        }
        setError("");

        if (input.toLowerCase().startsWith("summarize")) {
            const topic = input.toLowerCase().replace("summarize", "").trim();
            handleSummarize(topic);
        } else if (input.toLowerCase().startsWith("search the web for") || input.toLowerCase().startsWith("open browser and look for")) {
            try {
                const res = await axios.post("http://localhost:5000/api/gpt", { prompt: input });
                setResponse(res.data.response);
                speakOutLoud(res.data.response);
            } catch (err) {
                console.error("Error during web search:", err);
                setResponse("An error occurred during web search.");
            }
        } else if (input.toLowerCase().startsWith("play music")) {
            const songName = input.toLowerCase().replace("play music", "").trim();
            handleMusicCommand(songName);
        } else if (input.toLowerCase().startsWith("send message from my bot")) {
            const message = input.toLowerCase().replace("send message from my bot", "").trim();
            handleTelegramMessage(message);
        } else {
            try {
                const res = await axios.post("http://localhost:5000/api/gpt", { prompt: input });
                setResponse(res.data.response);
                speakOutLoud(res.data.response);
            } catch (err) {
                console.error("Error Details:", err);
                setResponse("An error occurred!");
            }
        }
    };

    const handleVoiceInput = () => {
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            setError("Your browser does not support Speech Recognition.");
            return;
        }

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        setIsRecording(true);
        setError("");

        recognition.start();

        recognition.onstart = () => {
            console.log("Speech recognition started. Please speak now...");
        };

        recognition.onresult = async (event) => {
            const spokenText = event.results[0][0].transcript;
            console.log("Transcribed text:", spokenText);

            setIsRecording(false);

            if (spokenText.toLowerCase().startsWith("summarize")) {
                const topic = spokenText.toLowerCase().replace("summarize", "").trim();
                handleSummarize(topic);
            } else if (spokenText.toLowerCase().startsWith("search the web for") || spokenText.toLowerCase().startsWith("open browser and look for")) {
                try {
                    const res = await axios.post("http://localhost:5000/api/gpt", { prompt: spokenText });
                    setResponse(res.data.response);
                    speakOutLoud(res.data.response);
                } catch (err) {
                    console.error("Error during web search:", err);
                    setResponse("An error occurred during web search.");
                }
            } else if (spokenText.toLowerCase().startsWith("play music")) {
                const songName = spokenText.toLowerCase().replace("play music", "").trim();
                handleMusicCommand(songName);
            } else if (spokenText.toLowerCase().startsWith("send message from my bot")) {
                const message = spokenText.toLowerCase().replace("send message from my bot", "").trim();
                handleTelegramMessage(message);
            } else {
                try {
                    const res = await axios.post("http://localhost:5000/api/gpt", { prompt: spokenText });
                    setResponse(res.data.response);
                    speakOutLoud(res.data.response);
                } catch (err) {
                    console.error("Error with GPT API:", err);
                    setResponse("An error occurred while processing your request.");
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            setError("Error during speech recognition. Please try again.");
            setIsRecording(false);
        };

        recognition.onend = () => {
            console.log("Speech recognition ended.");
            setIsRecording(false);
        };
    };

    const handleMusicCommand = async (song) => {
        try {
            const res = await axios.post("http://localhost:5000/api/play-music", { song });
            setResponse(res.data.response);
            speakOutLoud(res.data.response);
        } catch (err) {
            console.error("Error with music command:", err);
            setResponse("An error occurred while trying to play music.");
        }
    };

    const handleTelegramMessage = async (message) => {
        try {
            const res = await axios.post("http://localhost:5000/api/send-telegram", { message });
            setResponse(res.data.response);
            speakOutLoud(res.data.response);
        } catch (err) {
            console.error("Error with Telegram messaging:", err);
            setResponse("An error occurred while trying to send the message.");
        }
    };

    const handleSummarize = async (topic) => {
        try {
            const res = await axios.post("http://localhost:5000/api/summarize", { topic }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "summary.txt");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            setResponse("Summary generated and downloaded successfully!");
            speakOutLoud("Summary has been downloaded.");
        } catch (err) {
            console.error("Error with summarization:", err);
            setResponse("An error occurred while summarizing the topic.");
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className={`app-container ${darkMode ? "dark-mode" : "light-mode"}`}>
            <div className="top-section">
                <div className="title-section">
                    <h1>AI Assistant</h1>
                </div>
                <div className="logo-section">
                    <img src={aiLogo} alt="AI Assistant Logo" className="logo-image" />
                </div>
                {isRecording && (
                    <div className="wave-section">
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                    </div>
                )}
                {isSpeaking && !isRecording && (
                    <div className="speaking-animation">
                        <div className="speaking-dot"></div>
                        <div className="speaking-dot"></div>
                        <div className="speaking-dot"></div>
                    </div>
                )}
            </div>
            <div className="bottom-section">
                <div className="input-section">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message"
                        className="text-input"
                    />
                    <div className="button-section">
                        <button onClick={handleSubmit} className="submit-button">
                            Submit
                        </button>
                        <button
                            onClick={handleVoiceInput}
                            className={`speak-button ${isRecording ? "recording" : ""}`}
                            disabled={isRecording}
                        >
                            🎤 Speak
                        </button>
                    </div>
                </div>
                <div className="response-section">
                    <h2>Response:</h2>
                    <p>{response}</p>
                </div>
            </div>
            <button className="toggle-button" onClick={toggleDarkMode}>
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
        </div>
    );
}

export default App;
