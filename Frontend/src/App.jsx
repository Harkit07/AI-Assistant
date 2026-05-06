import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useEffect, useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { ToastContainer } from "react-toastify";
import axios from "axios";

function App() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const userRes = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/user/profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (userRes.status === 200) {
            setUser(userRes.data.user);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.log(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const providerValues = {
    token,
    setToken,
    user,
    setUser,
    loading,
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    newChat,
    setNewChat,
    prevChats,
    setPrevChats,
    allThreads,
    setAllThreads,
  };

  return (
    // min-h-dvh: uses dynamic viewport height on mobile (excludes browser chrome like address bar)
    // min-h-screen: fallback for browsers that don't support dvh
    <div className="flex min-h-dvh bg-[#212121] text-[#ececec] font-sans overflow-hidden">
      <ToastContainer
        position={isMobile ? "bottom-center" : "top-center"}
        autoClose={2000}
        // Responsive styles via toastClassName / bodyClassName
        toastClassName={() =>
          [
            "relative flex items-center justify-between",
            "rounded-lg shadow-lg overflow-hidden cursor-pointer",
            "bg-[#2e2e2e] text-[#ececec]",
            // Smaller padding and font on mobile
            "px-3 py-2 sm:px-4 sm:py-3",
            "text-xs sm:text-sm",
            "min-h-[44px] sm:min-h-[56px]",
            "mb-2 sm:mb-3",
          ].join(" ")
        }
        bodyClassName={() => "flex items-center gap-2 p-0 m-0 w-full"}
        style={{
          // Keep toasts away from edges on mobile
          bottom: isMobile ? "1rem" : undefined,
          top: !isMobile ? "1rem" : undefined,
          left: isMobile ? "50%" : undefined,
          transform: isMobile ? "translateX(-50%)" : undefined,
          width: isMobile ? "calc(100% - 2rem)" : "320px",
          maxWidth: "100%",
        }}
      />
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

export default App;
