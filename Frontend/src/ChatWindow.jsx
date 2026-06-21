import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import Sidebar from "./Sidebar.jsx";
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
    setNewChat,
    setPrevChats,
    theme,
    setTheme,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ================= CHAT =================
  const getReply = async (messageOverride = null) => {
    const messageToSend = messageOverride || prompt;

    if (!token) {
      setShowAuthPopup(true);
      return;
    }

    if (!messageToSend.trim()) return;

    setLoading(true);
    setNewChat(false);

    try {
      const response = await fetch("https://nexagpt.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          threadId: currThreadId,
        }),
      });

      const res = await response.json();
      setReply(res.reply);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SAVE CHAT =================
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

  // ================= VOICE INPUT (RESTORED) =================
  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser");
      return;
    }

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

  const handleProfileClick = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="chatWindow" onClick={() => setSidebarOpen(false)}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* NAVBAR */}
        <div className="navbar">
          <div
            className="hamburger"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(true);
            }}
          >
            <i className="fa-solid fa-bars"></i>
          </div>

          <span>NexaGPT</span>

          <div className="navRight">
            <button className="newChatBtn">New Chat</button>

            <div className="userIconDiv" onClick={handleProfileClick}>
              <div className="userIcon">
                <i className="fa-solid fa-user"></i>
              </div>
            </div>
          </div>
        </div>

        {/* DROPDOWN */}
        {isOpen && (
          <div className="dropdown">
            <div
              className="dropDownItem"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              Theme
            </div>

            {!token ? (
              <>
                <div
                  className="dropDownItem"
                  onClick={() => navigate("/login")}
                >
                  Login
                </div>
                <div
                  className="dropDownItem"
                  onClick={() => navigate("/signup")}
                >
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
                Logout
              </div>
            )}
          </div>
        )}

        {/* CHAT */}
        <Chat />

        <ScaleLoader color="var(--text)" loading={loading} />

        {isListening && (
          <div className="voiceBox loaderBox">
            <BeatLoader color="var(--text)" size={10} />
          </div>
        )}

        {liveTranscript && <div className="voiceText">{liveTranscript}</div>}

        {/* INPUT */}
        <div className="chatInput">
          <div className="inputBox">
            <input
              placeholder="Ask anything"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? getReply() : null)}
            />

            <div className="controls">
              <div onClick={startVoiceInput}>
                <i className="fa-solid fa-microphone"></i>
              </div>

              <div onClick={() => getReply()}>
                <i className="fa-solid fa-paper-plane"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AUTH POPUP */}
      {showAuthPopup && (
        <div className="authOverlay">
          <div className="authPopup">
            <h2>Login Required</h2>

            <div className="authButtons">
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/signup")}>Sign Up</button>
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
