import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  setTextareaRef,
}) => {
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (textareaRef.current && setTextareaRef) {
      setTextareaRef(textareaRef);
    }
  }, [setTextareaRef]);

  useEffect(() => {
    const initialQuery = location.state?.initialQuery || localStorage.getItem("initialQuery");
    console.log("MessageBox useEffect: initialQuery =", initialQuery, "textareaRef.current =", textareaRef.current);
    if (initialQuery && textareaRef.current) {
      textareaRef.current.value = initialQuery;
      console.log("Set userMessageBox value:", initialQuery);
      localStorage.removeItem("initialQuery"); // Clear after use
    } else if (initialQuery) {
      console.warn("Textarea not mounted yet for initialQuery:", initialQuery);
    } else {
      console.log("No initialQuery in location.state or localStorage");
    }
  }, [location, textareaRef.current]);

  console.log("Session Active:", sessionActive);
  console.log("textareaRef Active:", textareaRef);

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

  const handleImageUpload = useCallback(() => {
    const newImgUrl = "https://wallpaperaccess.com/full/528436.jpg";
    setImgUrl(newImgUrl);
  }, [setImgUrl]);

  const clearTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  }, []);

  const handleStopTraining = () => {
    stopSession();
    navigate("/home");
  };

  return (
    <div>
      <div className="w-screen px-52 mx-auto flex flex-col p-4 bg-transparent">
        <div className="w-[100%] flex h-[25vh] font-johnsonDisplay ">
          <div
            className="w-[70%] h-full overflow-auto z-20"
            style={{ scrollbarWidth: "thin" }}
          >
            <div
              id="assistantMessages"
              className="assistant-content w-full"
              dangerouslySetInnerHTML={{ __html: assistantMessages }}
            ></div>
          </div>
          <div className="w-[30%] flex relative" style={{ zIndex: 10 }}>
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
                style={{ zIndex: 5 }}
              ></video>
            </div>
            <div
              id="remoteVideo"
              className="w-[550px] h-[180px] absolute bottom-16 -left-10"
              style={{ zIndex: 10, background: "transparent" }}
            ></div>
          </div>
        </div>
        <div className="flex mt-4 flex-col bg-white z-30 rounded-xl border border-gray-200 p-2">
          <textarea
            id="userMessageBox"
            ref={textareaRef}
            className="w-full h-[60px] rounded-xl pt-2 px-4 resize-none bg-white text-gray-700 placeholder-gray-400 focus:outline-none text-semibold"
            onKeyUp={handleKeyUp}
            placeholder="Type or speak your message here..."
            style={{ scrollbarWidth: "thin" }}
          ></textarea>
          <div className="flex justify-end items-center">
            <div className="relative group">
              <button
                onClick={toggleMicrophone}
                disabled={!sessionActive}
                className="text-gray-500 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95"
                title={microphoneText}
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
                onClick={handleStopTraining}
                disabled={!sessionActive}
                className="text-[#1D1D1D8C] hover:bg-gray-100 disabled:opacity-50 rounded-full p-2 w-40 h-10 flex items-center justify-center border border-gray-200"
                title="Stop Training"
              >
                Stop Training
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Stop Training
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;