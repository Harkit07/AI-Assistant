import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { AuthProvider } from "./AuthContext";
import { ChatProvider } from "./ChatContext";
import { UIProvider } from "./UIContext";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <UIProvider>
          <div className="flex min-h-dvh bg-[#212121] text-[#ececec] font-sans overflow-hidden">
            <Sidebar />
            <ChatWindow />
          </div>
          <ToastContainer
            position="top-center"
            autoClose={2000}
            toastClassName={() =>
              [
                "relative flex items-center justify-between",
                "rounded-lg shadow-lg overflow-hidden cursor-pointer",
                "bg-[#2e2e2e] text-[#ececec]",
                "px-3 py-2 sm:px-4 sm:py-3",
                "text-xs sm:text-sm",
                "min-h-[44px] sm:min-h-[56px]",
                "mb-2 sm:mb-3",
              ].join(" ")
            }
            bodyClassName={() => "flex items-center gap-2 p-0 m-0 w-full"}
          />
        </UIProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
