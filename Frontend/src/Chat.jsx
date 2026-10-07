import React, { memo } from "react";
import { useChat } from "./ChatContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./Chat.css";

function Chat() {
  const { newChat, prevChats } = useChat();

  return (
    <div className="flex flex-col items-center flex-1 min-h-0 w-full">
      {newChat && (
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold shrink-0">
          Start a New Chat!
        </h1>
      )}

      <div className="chat-transcript w-full max-w-[95%] md:max-w-2xl lg:max-w-180 flex-1 min-h-0 overflow-y-auto px-3 md:px-5 lg:pl-5 lg:pr-24 py-6 md:py-8">
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
              <p className="bg-[#323232] mb-3 md:mb-5 px-4 md:px-5 py-2.5 rounded-2xl ml-10 sm:ml-24 md:ml-40 lg:ml-60 max-w-[80vw] md:max-w-125 w-fit text-xs md:text-sm">
                {chat.content}
              </p>
            ) : (
              <div className={`text-xs md:text-sm [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:text-xs md:[&_code]:text-sm ${chat.streaming ? "typing-message" : ""}`}>
                {chat.streaming && !chat.content ? (
                  <span className="typing-dots" aria-label="Assistant is typing">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {chat.content}
                  </ReactMarkdown>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(Chat);
