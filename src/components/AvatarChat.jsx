import { useState, useEffect } from "react";
import useAvatar from "../hooks/useAvatar";
import ErrorMessage from "./ErrorMessage";
import MessageBox from "./MessageBox";

const AvatarChat = ({ config, onStartingChange }) => {
  const [imgUrl, setImgUrl] = useState("");
  const [localErrorMessage, setLocalErrorMessage] = useState("");

  const {
    sessionActive,
    isSpeaking,
    chatHistory,
    assistantMessages,
    errorMessage,
    microphoneText,
    startSession,
    stopSession,
    toggleMicrophone,
    stopSpeaking,
    clearChatHistory,
    handleUserQuery,
  } = useAvatar({
    speechConfig: config.speech,
    openAIConfig: config.openAI,
    cogSearchConfig: config.cogSearch,
    sttTtsConfig: config.sttTts,
    avatarConfig: config.avatar,
    enableOyd: config.cogSearch.enableOyd,
    continuousConversation: config.sttTts.continuousConversation,
    showSubtitles: config.avatar.showSubtitles,
    autoReconnectAvatar: config.avatar.autoReconnect,
    useLocalVideoForIdle: config.avatar.useLocalVideoForIdle,
    prompt: config.openAI.prompt,
  });

  // Sync hook error with local state
  useEffect(() => {
    if (errorMessage) {
      setLocalErrorMessage(errorMessage);
    }
  }, [errorMessage]);

  // Auto-dismiss error
  useEffect(() => {
    if (localErrorMessage) {
      const timer = setTimeout(() => {
        setLocalErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [localErrorMessage]);

  const handleStartingChange = (isStarting) => {
    console.log("Starting state in grandchild:", isStarting);
    onStartingChange?.(isStarting); // forward to parent
  };
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <ErrorMessage errorMessage={localErrorMessage} />
      <MessageBox
        sessionActive={sessionActive}
        imgUrl={imgUrl}
        setImgUrl={setImgUrl}
        handleUserQuery={handleUserQuery}
        useLocalVideoForIdle={config.avatar.useLocalVideoForIdle}
        showSubtitles={config.avatar.showSubtitles}
        chatHistory={chatHistory}
        assistantMessages={assistantMessages}
        startSession={startSession}
        toggleMicrophone={toggleMicrophone}
        stopSpeaking={stopSpeaking}
        clearChatHistory={clearChatHistory}
        stopSession={stopSession}
        microphoneText={microphoneText}
        isSpeaking={isSpeaking}
        onStartingChange={handleStartingChange}
      />
    </div>
  );
};

export default AvatarChat;
