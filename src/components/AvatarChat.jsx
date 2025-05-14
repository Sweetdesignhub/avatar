import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import useAvatar from "../hooks/useAvatar";
import ErrorMessage from "./ErrorMessage";
import MessageBox from "./MessageBox";

const AvatarChat = ({ config, autoStart, onConnectionStatus }) => {
  const [imgUrl, setImgUrl] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    if (onConnectionStatus) {
      onConnectionStatus({ sessionActive, errorMessage });
    }
  }, [sessionActive, errorMessage, onConnectionStatus]);

  useEffect(() => {
    if (autoStart && !sessionActive) {
      startSession();
    }
  }, [autoStart, sessionActive, startSession]);

  const handleStopSession = () => {
    stopSession();
    navigate("/home");
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
        toggleMicrophone={toggleMicrophone}
        stopSpeaking={stopSpeaking}
        clearChatHistory={clearChatHistory}
        stopSession={handleStopSession}
        microphoneText={microphoneText}
        isSpeaking={isSpeaking}
      />
    </div>
  );
};

AvatarChat.propTypes = {
  config: PropTypes.shape({
    speech: PropTypes.shape({
      region: PropTypes.string.isRequired,
      apiKey: PropTypes.string.isRequired,
      enablePrivateEndpoint: PropTypes.bool.isRequired,
      EichmannPrivateEndpoint: PropTypes.string.isRequired,
    }).isRequired,
    openAI: PropTypes.shape({
      endpoint: PropTypes.string.isRequired,
      apiKey: PropTypes.string.isRequired,
      deploymentName: PropTypes.string.isRequired,
      prompt: PropTypes.string.isRequired,
    }).isRequired,
    cogSearch: PropTypes.shape({
      enableOyd: PropTypes.bool.isRequired,
      endpoint: PropTypes.string.isRequired,
      apiKey: PropTypes.string.isRequired,
      indexName: PropTypes.string.isRequired,
    }).isRequired,
    sttTts: PropTypes.shape({
      sttLocales: PropTypes.string.isRequired,
      ttsVoice: PropTypes.string.isRequired,
      customVoiceEndpointId: PropTypes.string.isRequired,
      personalVoiceSpeakerProfileID: PropTypes.string.isRequired,
      continuousConversation: PropTypes.bool.isRequired,
    }).isRequired,
    avatar: PropTypes.shape({
      character: PropTypes.string.isRequired,
      style: PropTypes.string.isRequired,
      customized: PropTypes.bool.isRequired,
      autoReconnect: PropTypes.bool.isRequired,
      useLocalVideoForIdle: PropTypes.bool.isRequired,
      showSubtitles: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  autoStart: PropTypes.bool,
  onConnectionStatus: PropTypes.func,
};

AvatarChat.defaultProps = {
  autoStart: false,
  onConnectionStatus: null,
};

export default AvatarChat;