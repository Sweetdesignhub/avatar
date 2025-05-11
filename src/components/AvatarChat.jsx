import { useState } from "react";
import useAvatar from "../hooks/useAvatar";
import ErrorMessage from "./ErrorMessage";
import MessageBox from "./MessageBox";

const AvatarChat = ({ config, onStartingChange }) => {
  const [imgUrl, setImgUrl] = useState("");

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

  const handleStartingChange = (isStarting) => {
    // console.log("Starting state in grandchild:", isStarting);
    onStartingChange?.(isStarting); // forward to parent
  };
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <ErrorMessage errorMessage={errorMessage} />
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
