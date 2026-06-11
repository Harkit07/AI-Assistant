import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat({ showLogin, setShowLogin }) {
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
      {newChat && (
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
          Start a New Chat!
        </h1>
      )}

      {/* Scrollable message area */}
      <div className="w-full max-w-[95%] md:max-w-2xl lg:max-w-180 overflow-y-auto px-3 md:px-5 lg:pl-5 lg:pr-24 py-6 md:py-8">
        {/* All messages except the last */}
        {prevChats?.slice(0, -1).map((chat, idx) => (
          <div
            key={`${chat.role}-${idx}`}
            className={
              chat.role === "user"
                ? "flex justify-end text-sm"
                : "text-left text-sm"
            }
          >
            {chat.role === "user" ? (
              <p className="bg-[#323232] mb-6 md:mb-10 px-4 md:px-5 py-2.5 rounded-2xl ml-10 sm:ml-24 md:ml-40 lg:ml-60 max-w-[80vw] md:max-w-125 w-fit text-xs md:text-sm">
                {chat.content}
              </p>
            ) : (
              <div className="text-xs md:text-sm [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:text-xs md:[&_code]:text-sm">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {chat.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        {/* Last message — typing or static */}
        {prevChats.length > 0 && (
          <>
            {latestReply === null ? (
              <div
                key="non-typing"
                className="text-left text-xs md:text-sm [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:text-xs md:[&_code]:text-sm"
              >
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
              </div>
            ) : (
              <div
                key="typing"
                className="text-left text-xs md:text-sm [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:text-xs md:[&_code]:text-sm"
              >
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
