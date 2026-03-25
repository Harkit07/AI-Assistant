import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
  const {
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
    try {
      const response = await fetch("http://localhost:8080/api/thread");
      const res = await response.json();
      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      setAllThreads(filteredData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${newThreadId}`,
      );
      const res = await response.json();
      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${threadId}`,
        {
          method: "DELETE",
        },
      );
      const res = await response.json();
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );
      if (threadId === currThreadId) createNewChat();
    } catch (err) {
      console.log(err);
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
