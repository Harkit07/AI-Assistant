import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import Login from "./login.jsx";
import axios from "axios";
import { toast } from "react-toastify";

function ChatWindow() {
  const {
    token,
    setToken,
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

  useEffect(() => {
    const fetchThreadHistory = async () => {
      if (!currThreadId || !token) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/thread/${currThreadId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.status == 200) {
          setPrevChats(response.data);
          setNewChat(false);
        }
      } catch (err) {
        // If 404/403, it means the thread is new or unauthorized
        if (err.response?.status === 404) {
          setPrevChats([]);
          setNewChat(true);
        }
      }
    };

    fetchThreadHistory();
  }, [currThreadId, token, setPrevChats, setNewChat]);

  const getReply = async () => {
    const currentToken = localStorage.getItem("token");

    // FLOW: Block chat and force login if no token
    if (!currentToken) {
      toast.info("Please login to start chatting!");
      setShowLogin(true);
      return;
    }

    if (loading || !prompt.trim()) return;

    setLoading(true);
    setNewChat(false);
    setCurrPrompt(prompt);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/chat`,
        {
          message: prompt,
          threadId: currThreadId,
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        },
      );

      if (response.data && response.data.reply) {
        setReply(response.data.reply);
      } else {
        toast.error("Failed to get reply");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.error || "Network error. Please try again.";
      toast.error(errorMessage);
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

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/logout`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 200) {
        localStorage.removeItem("token");
        setToken(null);
        toast.success("Logout successful!");
        setPrevChats([]);
        setNewChat(true);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

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
          {!token ? (
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
          ) : (
            <div
              className="dropDownItem text-sm my-1.5 py-2 px-0.5 cursor-pointer"
              onClick={handleLogout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
            </div>
          )}
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
