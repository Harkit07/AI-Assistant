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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 2️⃣ Fetch user ONLY if token exists
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
          setUser(null); // logged out user
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
    <div className="flex min-h-screen bg-[#212121] text-[#ececec] font-sans">
      <ToastContainer position="top-center" autoClose={2000} />
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

export default App;
