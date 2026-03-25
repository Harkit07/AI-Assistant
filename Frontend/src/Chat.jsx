import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Login from "./login";

function Chat() {
  const { newChat, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

  useEffect(() => {
    if (reply === null) {
      setLatestReply(null);
      return;
    }

    if (!prevChats?.length) return;

    let idx = 0;
    const interval = setInterval(() => {
      setLatestReply(reply.slice(0, idx + 1));
      idx++;
      if (idx >= reply.length) clearInterval(interval);
    }, 10);

    return () => clearInterval(interval);
  }, [prevChats, reply]);

  return (
    <>
      {newChat && <h1 className="text-5xl">Start a New Chat!</h1>}
      <Login />
      <div className="max-w-180 overflow-y-auto pl-5 pr-25 py-8">
        {prevChats?.slice(0, -1).map((chat, idx) => (
          <div
            className={
              chat.role === "user"
                ? "flex justify-end text-sm"
                : "text-left text-sm"
            }
            key={idx}
          >
            {chat.role === "user" ? (
              <p className="bg-[#323232] mb-10 px-5 py-2.5 rounded-2xl ml-60 max-w-125 w-fit">
                {chat.content}
              </p>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {chat.content}
              </ReactMarkdown>
            )}
          </div>
        ))}

        {prevChats.length > 0 && (
          <>
            {latestReply === null ? (
              <div className="text-left text-sm" key="non-typing">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-left text-sm" key="typing">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {latestReply}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Chat;
