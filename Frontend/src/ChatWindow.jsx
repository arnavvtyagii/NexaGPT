import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader, BeatLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
    theme,
    setTheme,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // =========================
  // TEXT CHAT
  // =========================
  const getReply = async (messageOverride = null) => {
    const token = localStorage.getItem("token");

    const messageToSend = messageOverride || prompt;

    if (!token) {
      setShowAuthPopup(true);
      return;
    }

    if (!messageToSend.trim()) return;

    setLoading(true);
    setNewChat(false);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: messageToSend,
        threadId: currThreadId,
      }),
    };

    try {
      const response = await fetch(
        "https://nexagpt.onrender.com/api/chat",
        options,
      );

      const res = await response.json();

      setReply(res.reply);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SAVE CHAT HISTORY
  // =========================
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prev) => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: reply },
      ]);
    }

    setPrompt("");
  }, [reply]);

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = true;

    setIsListening(true);
    setLiveTranscript("");

    let finalText = "";

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += text;
        } else {
          interim += text;
        }
      }

      setLiveTranscript(interim || finalText);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (finalText.trim()) {
        setPrompt(finalText);
        getReply(finalText);
      }

      setLiveTranscript("");
    };

    recognition.start();
  };
  return (
    <>
      <div className="chatWindow">
        <div className="navbar">
          <span>NexaGPT</span>

          <div className="userIconDiv" onClick={handleProfileClick}>
            <span className="userIcon">
              <i className="fa-solid fa-user"></i>
            </span>
          </div>
        </div>

        {isOpen && (
          <div
            className={`dropdown ${
              theme === "dark" ? "dropdown-dark" : "dropdown-light"
            }`}
          >
            <div
              className="dropDownItem"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <i
                className={`fa-solid ${
                  theme === "dark" ? "fa-sun" : "fa-moon"
                }`}
              ></i>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </div>

            {!token ? (
              <>
                <div
                  className="dropDownItem"
                  onClick={() => navigate("/login")}
                >
                  <i className="fa-solid fa-right-to-bracket"></i>
                  Login
                </div>

                <div
                  className="dropDownItem"
                  onClick={() => navigate("/signup")}
                >
                  <i className="fa-solid fa-user-plus"></i>
                  Sign Up
                </div>
              </>
            ) : (
              <div
                className="dropDownItem"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/");
                  window.location.reload();
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                Log Out
              </div>
            )}
          </div>
        )}

        <Chat />

        <ScaleLoader color="var(--text)" loading={loading} />
        {isListening && (
          <div className="voiceBox loaderBox">
            <BeatLoader color="var(--text)" size={10} />
          </div>
        )}

        {liveTranscript && <div className="voiceText">{liveTranscript}</div>}
        <div className="chatInput">
          <div className="inputBox">
            <input
              placeholder="Ask anything"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? getReply() : null)}
            />
            <div className="controls">
              <div id="submit" onClick={startVoiceInput}>
                <i className="fa-solid fa-microphone"></i>
              </div>
              <div id="submit" onClick={() => getReply()}>
                <i className="fa-solid fa-paper-plane"></i>
              </div>
            </div>
          </div>

          <p className="info">
            NexaGPT can make mistakes. Check important info. See Cookie
            Preferences.
          </p>
        </div>
      </div>

      {showAuthPopup && (
        <div className="authOverlay">
          <div className="authPopup">
            <h2>Login Required</h2>
            <p>Please login or create an account to start chatting.</p>

            <div className="authButtons">
              <button onClick={() => (window.location.href = "/login")}>
                Login
              </button>

              <button onClick={() => (window.location.href = "/signup")}>
                Sign Up
              </button>
            </div>

            <button
              className="closeBtn"
              onClick={() => setShowAuthPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWindow;
