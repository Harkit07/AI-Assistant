import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import Login from "./login.jsx";

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
  const [currPrompt, setCurrPrompt] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const getReply = async () => {
    if (loading || !prompt.trim()) return;

    setLoading(true);
    setNewChat(false);
    setCurrPrompt(prompt);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currPrompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        { role: "user", content: currPrompt },
        { role: "assistant", content: reply },
      ]);
      setPrompt("");
      setLoading(false);
    }
  }, [reply]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const handleVisible = () => setShowLogin(true);

  const handleProfileClick = () => setIsOpen(!isOpen);

  return (
    <div className="bg-[#212121] h-screen w-full flex flex-col justify-between items-center text-center overflow-hidden">
      <Login visible={showLogin} setVisible={setShowLogin} />
      {/* Navbar */}
      <div className="w-full flex justify-between items-center">
        <span className="m-4 mx-8">
          ChatGPT <i className="fa-solid fa-chevron-down"></i>
        </span>
        <div
          className="m-4 mx-8"
          onClick={(e) => {
            e.stopPropagation();
            handleProfileClick();
          }}
        >
          <span className="bg-[#339cff] h-6.25 w-6.25 rounded-full flex items-center justify-center cursor-pointer">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-16 right-16 w-37.5 bg-[#323232] px-2 py-1.5 rounded-md text-left z-1000 shadow-[0px_2px_8px_rgba(0,0,0,0.1)]">
          <div
            className="dropDownItem text-sm my-1.5 py-2 px-0.5 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleVisible();
              setIsOpen(false);
            }}
          >
            <i className="fa-regular fa-user"></i> Login/Signup
          </div>
          <div className="dropDownItem text-sm my-1.5 py-2 px-0.5 cursor-pointer">
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </div>
        </div>
      )}

      <Chat showLogin={showLogin} setShowLogin={setShowLogin} />

      <ScaleLoader color="#fff" loading={loading} />

      {/* Chat Input */}
      <div className="w-full flex flex-col justify-center items-center">
        <div className="w-full relative max-w-175 flex justify-between items-center">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !loading ? getReply() : null
            }
            disabled={loading}
            className="w-full"
          />
          <div
            id="submit"
            onClick={getReply}
            className="cursor-pointer h-8.75 w-8.75 text-xl absolute right-3.75 flex items-center justify-center"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className="text-xs py-2 px-2 text-[#b4b4b4]">
          ChatGPT can make mistakes. Check important info. See Cookie
          Preferences.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
