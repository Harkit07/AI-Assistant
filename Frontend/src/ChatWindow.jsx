import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currPrompt, setCurrPrompt] = useState(""); // ✅ snapshot prompt before it clears

  const getReply = async () => {
    if (loading || !prompt.trim()) return; // ✅ prevent spam & empty sends

    setLoading(true);
    setNewChat(false);
    setCurrPrompt(prompt); // ✅ save prompt before it gets cleared

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt, threadId: currThreadId }),
    };

    try {
      const response = await fetch("http://localhost:8080/api/chat", options);
      const res = await response.json();
      console.log(res);

      if (res.reply) {
        setReply(res.reply);
      } else {
        console.error("No reply in response:", res);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false); // ✅ stop loading on error
    }
  };

  // Append new chat to prevChats when reply arrives
  useEffect(() => {
    if (currPrompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        { role: "user", content: currPrompt }, // ✅ use snapshot, not prompt (which is cleared)
        { role: "assistant", content: reply },
      ]);
      setPrompt("");
      setLoading(false); // ✅ stop loading only after reply is set
    }
  }, [reply]); // eslint-disable-line

  const handleProfileClick = () => setIsOpen(!isOpen);

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>
          ChatGPT <i className="fa-solid fa-chevron-down"></i>
        </span>
        <div className="userIconDiv" onClick={handleProfileClick}>
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i> Settings {/* ✅ className */}
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </div>
        </div>
      )}

      <Chat></Chat>

      <ScaleLoader color="#fff" loading={loading}></ScaleLoader>

      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !loading ? getReply() : null
            } // ✅ block Enter when loading
            disabled={loading} // ✅ disable input while loading
          />
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className="info">
          ChatGPT can make mistakes. Check important info. See Cookie
          Preferences.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
