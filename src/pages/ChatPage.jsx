import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AvatarChat from "../components/AvatarChat";

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState("");
  const navigate = useNavigate();

  const config = {
    speech: {
      region: "southeastasia",
      apiKey: `8iyiCzvNWFlp3LjQQ8jOkNd07ehw4GhlQGBB4JpvD98IAiiiVNPkJQQJ99BEACqBBLyXJ3w3AAAYACOGu15l`,
      enablePrivateEndpoint: false,
      EichmannPrivateEndpoint: "",
    },
    openAI: {
      endpoint: "https://athar-ma6hbszz-southindia.openai.azure.com",
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
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
      ttsVoice: "en-US-ChristopherNeural",
      customVoiceEndpointId: "",
      personalVoiceSpeakerProfileID: "",
      continuousConversation: false,
    },
    avatar: {
      character: "jeff",
      style: "business",
      customized: false,
      autoReconnect: true,
      useLocalVideoForIdle: false,
      showSubtitles: false,
    },
  };

  const handleConnectionStatus = ({ sessionActive, errorMessage }) => {
    if (sessionActive) {
      setIsLoading(false);
      setConnectionError("");
    } else if (errorMessage) {
      setIsLoading(false);
      setConnectionError(errorMessage);
    }
  };

  useEffect(() => {
    if (connectionError) {
      const timer = setTimeout(() => {
        navigate("/home");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionError, navigate]);

  return (
    <div
      className="min-h-[90vh] flex flex-col justify-start items-center bg-cover bg-center pt-6"
      style={{ backgroundImage: "url('/Background_WithoutIcon.jpg')" }}
    >
      {isLoading && !connectionError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              As a surgeon, every decision counts.
            </h2>
            <p className="text-gray-600 mb-4">
              You’re about to receive guidance from a seasoned expert who has
              mastered the art of precision and foresight.
            </p>
            <p className="text-lg font-semibold text-blue-600">Stay sharp.</p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}
      {connectionError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Connection to Surgeon Lost
            </h2>
            <p className="text-gray-600 mb-4">
              Our expert couldn't join the operating room this time. Your
              precision is unmatched—let's try reconnecting soon.
            </p>
            <p className="text-lg font-semibold text-gray-800">
              Redirecting to home in 5 seconds...
            </p>
          </div>
        </div>
      )}
      <AvatarChat
        config={config}
        autoStart={true}
        onConnectionStatus={handleConnectionStatus}
      />
    </div>
  );
}