import { useState, useRef } from "react";
import ErrorMessage from "./ErrorMessage";
import MessageBox from "./MessageBox";
import { useAvatarContext } from "../contexts/AvatarContext";

const AvatarChat = () => {
  const [imgUrl, setImgUrl] = useState("");
  const textareaRef = useRef(null);

  const {
    sessionActive,
    isSpeaking,
    chatHistory,
    assistantMessages,
    errorMessage,
    microphoneText,
    stopSession,
    toggleMicrophone,
    stopSpeaking,
    clearChatHistory,
    handleUserQuery,
  } = useAvatarContext();

  const setTextareaRef = (ref) => {
    textareaRef.current = ref.current;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <ErrorMessage errorMessage={errorMessage} />
      <MessageBox
        sessionActive={sessionActive}
        imgUrl={imgUrl}
        setImgUrl={setImgUrl}
        handleUserQuery={handleUserQuery}
        useLocalVideoForIdle={false}
        showSubtitles={false}
        chatHistory={chatHistory}
        assistantMessages={assistantMessages}
        toggleMicrophone={toggleMicrophone}
        stopSpeaking={stopSpeaking}
        clearChatHistory={clearChatHistory}
        stopSession={stopSession}
        microphoneText={microphoneText}
        isSpeaking={isSpeaking}
        setTextareaRef={setTextareaRef}
      />
    </div>
  );
};

export default AvatarChat;