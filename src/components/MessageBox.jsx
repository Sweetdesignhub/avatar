import { useCallback, useRef } from "react";
import DOMPurify from "dompurify";

const MessageBox = ({
  sessionActive,
  imgUrl,
  setImgUrl,
  handleUserQuery,
  useLocalVideoForIdle,
  showSubtitles,
  chatHistory,
  assistantMessages,
  toggleMicrophone,
  stopSpeaking,
  clearChatHistory,
  stopSession,
  microphoneText,
  isSpeaking,
}) => {
  const textareaRef = useRef(null);

  const sanitizedMessages = DOMPurify.sanitize(assistantMessages);

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const userQuery = textareaRef.current.value.trim();
        if (userQuery) {
          const userQueryHTML = imgUrl
            ? `<br/><img src="${imgUrl}" style="width:200px;height:200px"/><br/>${userQuery}`
            : userQuery;
          handleUserQuery(userQuery, userQueryHTML, imgUrl);
          textareaRef.current.value = "";
          setImgUrl("");
        }
      }
    },
    [handleUserQuery, imgUrl, setImgUrl]
  );

  return (
    <div className="w-full flex flex-col gap-8 items-center px-56 justify-center">
      <div className="w-full flex flex-row h-[30vh]">
        <div
          className="w-[80%] p-1 rounded-lg font-johnsonDisplay font-semibold text-xl overflow-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          <div
            id="assistantMessages"
            className="assistant-content"
            dangerouslySetInnerHTML={{ __html: sanitizedMessages }}
          />
        </div>
        <div className="w-[20%] flex flex-col items-center relative">
          <div
            id="localVideo"
            className={`${
              useLocalVideoForIdle && !sessionActive ? "" : "hidden"
            }`}
          >
            <video
              src="/video/lisa-casual-sitting-idle.mp4"
              autoPlay
              loop
              muted
              className="w-full max-w-[320px] h-auto"
            />
          </div>
          <div
            id="remoteVideo"
            className="w-full  h-[220px] bg-transparent absolute bottom-4"
          />
          <div
            id="subtitles"
            className={`w-full text-center text-white text-sm absolute bottom-2 ${
              showSubtitles ? "" : "hidden"
            }`}
            style={{
              textShadow:
                "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
            }}
          />
        </div>
      </div>
      <div className="w-full  flex justify-center">
        <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-md p-4 w-full">
          <textarea
            id="userMessageBox"
            ref={textareaRef}
            className="w-full h-[60px] rounded-xl pt-2 px-4 resize-none bg-white text-gray-700 placeholder-gray-400 focus:outline-none text-semibold"
            onKeyUp={handleKeyUp}
            placeholder="Type or speak your message here..."
            aria-label="Type or speak your message"
            style={{ scrollbarWidth: "thin" }}
          />
          <div className="flex justify-end items-center gap-1">
            <div className="relative group">
              <button
                onClick={toggleMicrophone}
                disabled={!sessionActive}
                className="text-gray-500 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95"
                title={microphoneText}
                aria-label={microphoneText}
              >
                <img
                  src="/mic-icon.svg"
                  alt="Mic Icon"
                  className="w-3/4 h-3/4 transition-transform duration-200 group-hover:scale-110"
                />
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {microphoneText}
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                className="text-gray-500 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95"
                title="Stop Speaking"
                aria-label="Stop Speaking"
              >
                <svg
                  className="w-10 h-10 transition-transform duration-200 border border-gray-200 rounded-full group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 6h12v12H6z" />
                </svg>
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Stop Speaking
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={stopSession}
                disabled={!sessionActive}
                className="text-[#1D1D1D8C] hover:bg-gray-100 disabled:opacity-50 rounded-full p-2 w-40 h-10 flex items-center justify-center border border-gray-200"
                title="Close Avatar Session"
                aria-label="Close Avatar Session"
              >
                Stop Training
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Close Avatar Session
              </div>
            </div>
          </div>
        </div>
      
      </div>
    </div>
  );
};

export default MessageBox;
