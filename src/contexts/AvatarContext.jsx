import { createContext, useContext, useState } from "react";
import useAvatar from "../hooks/useAvatar";

const AvatarContext = createContext();

export const AvatarProvider = ({ children }) => {
  const [popupState, setPopupState] = useState(null);

  const config = {
    speech: {
      region: "southeastasia",
      apiKey:  "8iyiCzvNWFlp3LjQQ8jOkNd07ehw4GhlQGBB4JpvD98IAiiiVNPkJQQJ99BEACqBBLyXJ3w3AAAYACOGu15l",
      enablePrivateEndpoint: false,
      EichmannPrivateEndpoint: "",
    },
    openAI: {
      endpoint: "https://athar-ma6hbszz-southindia.openai.azure.com",
      apiKey:  "3aAKd0F24mOsy1x8eJrqVVdVuTKKUwGX1ySDOJqCaSwhKLDmrTASJQQJ99BEAC77bzfXJ3w3AAAAACOG4Cq3",
      deploymentName: "gpt-4o",
      prompt: `You are a highly skilled surgical AI assistant, acting as a fellow surgeon in the operating room. Offer quick, expert, context-aware guidance on surgical tools, techniques, anatomy, and emergency responses (e.g., cardiac arrest, bleeding). Speak like a trusted surgical colleague — concise (25–30 words), confident, and focused on practical, real-time support during procedures.

Tone: Supportive, competent, and human-like — like a senior resident or attending assisting.
Behavior: No over-explaining, no hesitation — just confident, helpful direction like you'd expect from a colleague who knows their stuff.`,
    },
    cogSearch: {
      enableOyd: false,
      endpoint: "",
      apiKey: "",
      indexName: "",
    },
    sttTts: {
      sttLocales: "en-US,de-DE,es-ES,fr-FR,it-IT,ja-JP,ko-KR,zh-CN",
      ttsVoice: "en-US-EchoTurboMultilingualNeural",
      customVoiceEndpointId: "",
      personalVoiceSpeakerProfileID: "",
      continuousConversation: false,
    },
    avatar: {
      character: "harry",
      style: "business",
      customized: false,
      autoReconnect: true,
      useLocalVideoForIdle: false,
      showSubtitles: false,
    },
  };

  const showLoadingPopup = () => {
    setPopupState({
      type: "loading",
      message: `As a surgeon, every decision counts.\nYou’re about to receive guidance from a seasoned expert who has mastered the art of precision and foresight.\nStay sharp.`,
    });
  };

  const showErrorPopup = (message) => {
    setPopupState({ type: "error", message });
  };

  const clearPopup = () => {
    setPopupState(null);
  };

  const avatar = useAvatar({
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
    showLoadingPopup,
    showErrorPopup,
    clearPopup,
  });

  return (
    <AvatarContext.Provider value={{ ...avatar, popupState, showLoadingPopup, showErrorPopup, clearPopup }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatarContext = () => useContext(AvatarContext);