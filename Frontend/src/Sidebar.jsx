import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import axios from "axios";

function Sidebar() {
  const {
    token,
    setToken,
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  const getAllThreads = async () => {
    // If the user is not logged in, clear the threads and don't make the request
    if (!token) {
      setAllThreads([]);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/thread`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token to backend
          },
        },
      );

      if (response.status == 200) {
        const filteredData = response.data.map((thread) => ({
          threadId: thread.threadId,
          title: thread.title,
        }));

        setAllThreads(filteredData);
      }
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId, token]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      // FIXED: Added Axios and Authorization header
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/thread/${newThreadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPrevChats(response.data);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.error("Failed to change thread:", err);
    }
  };

  const deleteThread = async (threadId) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      // FIXED: Added Axios and Authorization header
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/thread/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );
      if (threadId === currThreadId) createNewChat();
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  return (
    <section className="bg-[#171717] text-[#b4b4b4] h-screen w-80 flex flex-col justify-between">
      <button
        onClick={createNewChat}
        className="flex justify-between items-center m-2.5 p-2.5 rounded-md bg-transparent border border-white/50 cursor-pointer"
      >
        <img
          src="/blacklogo.png"
          alt="gpt logo"
          className="h-6.25 w-6.25 bg-white rounded-full object-cover"
        />
        <span className="text-xl">
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      <ul className="history m-2.5 p-2.5 h-full">
        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            className={`list-none cursor-pointer py-0.5 px-1.5 mb-1.5 text-sm border-10px border-transparent relative whitespace-nowrap overflow-hidden text-ellipsis
              ${thread.threadId === currThreadId ? "bg-white/5 rounded-[10px]" : ""}`}
          >
            {thread.title}
            <i
              className="fa-solid fa-trash opacity-0 absolute right-0"
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      <div className="p-2.5 m-2.5 text-sm text-center border-t border-white/50">
        <p>By Harkit Singh &hearts;</p>
      </div>
    </section>
  );
}

export default Sidebar;
