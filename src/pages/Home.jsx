import AvatarChat from "../components/AvatarChat";

export default function Home() {
    const config = {
        speech: {
          region: 'southeastasia',
          apiKey: '4yEIQp26V39RSfLeem530nZx7ev07IpyfadizBcIUao9OkHWhrSjJQQJ99BEACqBBLyXJ3w3AAAYACOGmUY3',
          enablePrivateEndpoint: false,
          EichmannPrivateEndpoint: ''
        },
        openAI: {
          endpoint: 'https://athar-ma6hbszz-southindia.openai.azure.com',
          apiKey: '3aAKd0F24mOsy1x8eJrqVVdVuTKKUwGX1ySDOJqCaSwhKLDmrTASJQQJ99BEAC77bzfXJ3w3AAAAACOG4Cq3',
          deploymentName: 'gpt-4o',
          prompt: 'You are an AI assistant that helps people find information.'
        },
        cogSearch: {
          enableOyd: false,
          endpoint: '',
          apiKey: '',
          indexName: ''
        },
        sttTts: {
          sttLocales: 'en-US,de-DE,es-ES,fr-FR,it-IT,ja-JP,ko-KR,zh-CN',
          ttsVoice: 'en-US-AvaMultilingualNeural',
          customVoiceEndpointId: '',
          personalVoiceSpeakerProfileID: '',
          continuousConversation: false
        },
        avatar: {
          character: 'jeff',
          style: 'business',
          customized: false,
          autoReconnect: false,
          useLocalVideoForIdle: false,
          showSubtitles: false
        }
      };
  return (
    <div>
      <div className="max-w-4xl mx-auto text-center flex flex-col justify-center items-center">
        <div className="flex flex-col items-center mt-40 px-8">
          <h1 className="font-serif font-semibold text-6xl leading-[110px] tracking-tight text-center">
            Revolutionizing
          </h1>
          <div className="flex flex-row">
            <h1 className="font-serif font-semibold text-6xl text-red-600 leading-[110px] tracking-tight text-center">
              Heart Surgery{" "}
            </h1>
            <h1 className="px-4 font-serif font-semibold text-6xl leading-[110px] tracking-tight text-center">
              with AI
            </h1>
          </div>
          {/* 🫀 Add Heart image wherever you wish */}
          {/* <img
            src="/Heart.png"
            alt="Heart AI"
            className="w-28 absolute top-[140px] left-[1140px] my-6"
          />
          <img
            src="/HeartRateMonitor.png"
            alt="Heart Rate Monitor AI"
            className="w-24 absolute top-[120px] left-[380px] my-6"
          />
          <img
            src="/Ambulance.png"
            alt="Ambulance"
            className="w-28 absolute top-[540px] left-[1240px] my-6"
          />
          <img
            src="/FirstAidKit.png"
            alt="First Aid Kit AI"
            className="w-32 absolute top-[500px] left-[240px] my-6"
          /> */}
        </div>
      </div>
      <div className="mt-8 w-full flex items-center justify-center rounded-3xl">
        <AvatarChat config={config} />
      </div>
    </div>
  );
}