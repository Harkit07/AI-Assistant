import React, { memo } from "react";
import { useChat } from "./ChatContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./Chat.css";

function Chat() {
  const { newChat, prevChats } = useChat();

  return (
    <>
      {newChat && (
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
          Start a New Chat!
        </h1>
      )}

      <div className="w-full max-w-[95%] md:max-w-2xl lg:max-w-180 overflow-y-auto px-3 md:px-5 lg:pl-5 lg:pr-24 py-6 md:py-8">
        {prevChats?.map((chat, idx) => (
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
      </div>
    </>
  );
}

export default memo(Chat);
