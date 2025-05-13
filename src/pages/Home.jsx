import { useState } from "react";
import AvatarChat from "../components/AvatarChat";

export default function Home() {
  const [isStarting, setIsStarting] = useState(true);

  const handleStartingFromGrandchild = (val) => {
    // console.log("Starting reached App level:", val);
    setIsStarting(val);
  };

  const config = {
    speech: {
      region: "southeastasia",
      apiKey:
        "4yEIQp26V39RSfLeem530nZx7ev07IpyfadizBcIUao9OkHWhrSjJQQJ99BEACqBBLyXJ3w3AAAYACOGmUY3",
      enablePrivateEndpoint: false,
      EichmannPrivateEndpoint: "",
    },
    openAI: {
      endpoint: "https://athar-ma6hbszz-southindia.openai.azure.com",
      apiKey:
        "3aAKd0F24mOsy1x8eJrqVVdVuTKKUwGX1ySDOJqCaSwhKLDmrTASJQQJ99BEAC77bzfXJ3w3AAAAACOG4Cq3",
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

  // console.log("Home config:", config);

  return (
    <div
      style={{
        backgroundImage: isStarting
          ? "url('/Backgorund.jpg')"
          : "url('/Backgorund_WithoutIcon.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="min-h-[90vh] overflow-y-auto overflow-x-hidden"
    >
      {" "}
      <div className="max-w-4xl mx-auto text-center flex flex-col justify-center items-center">
        {isStarting && (
          <div className="flex flex-col items-center mt-40 px-8">
            <h1 className="font-johnsonDisplay font-bold text-7xl leading-[110px] tracking-[0.15px] text-center align-middle">
              Revolutionizing
            </h1>
            <div className="flex flex-row">
              <h1 className="font-johnsonDisplay font-bold  text-7xl  text-red-600 leading-[110px] tracking-[0.15px]  align-middle">
                Heart Surgery{" "}
              </h1>
              <h1 className="px-6 font-johnsonDisplay font-bold  text-7xl  leading-[110px] tracking-[0.15px]  align-middle">
                with AI
              </h1>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 w-full flex items-center justify-center rounded-3xl">
        <AvatarChat
          config={config}
          onStartingChange={handleStartingFromGrandchild}
        />
      </div>
    </div>
  );
}
