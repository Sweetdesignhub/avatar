import { useState, useEffect, useRef, useCallback } from "react";

const useAvatar = ({
  speechConfig,
  openAIConfig,
  cogSearchConfig,
  sttTtsConfig,
  avatarConfig,
  enableOyd,
  continuousConversation,
  showSubtitles,
  autoReconnectAvatar,
  useLocalVideoForIdle,
  prompt,
  showLoadingPopup,
  showErrorPopup,
  clearPopup,
}) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatHistory, setChatHistory] = useState("");
  const [assistantMessages, setAssistantMessages] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [microphoneText, setMicrophoneText] = useState("Start Microphone");

  const speechRecognizer = useRef(null);
  const avatarSynthesizer = useRef(null);
  const peerConnection = useRef(null);
  const peerConnectionDataChannel = useRef(null);
  const messages = useRef([]);
  const messageInitiated = useRef(false);
  const dataSources = useRef([]);
  const spokenTextQueue = useRef([]);
  const isReconnecting = useRef(false);
  const speakingText = useRef("");
  const lastInteractionTime = useRef(new Date());
  const lastSpeakTime = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const messageTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const responseQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  const hasWelcomed = useRef(false); // Added for welcome message

  const sentenceLevelPunctuations = [
    ".", "?", "!", ":", ";", "。", "？", "！", "：", "；",
  ];
  const enableDisplayTextAlignmentWithSpeech = true;
  const enableQuickReply = false;
  const quickReplies = [
    "Let me take a look.",
    "Let me check.",
    "One moment, please.",
  ];
  const byodDocRegex = new RegExp(/\[doc(\d+)\]/g);

  const htmlEncode = (text) => {
    const entityMap = {
      "&": "&",
      "<": "<",
      ">": ">",
      '"': "",
      "'": "'",
      "/": "/",
    };
    return String(text).replace(/[&<>"'\/]/g, (match) => entityMap[match]);
  };

  const setErrorMessageWithTimeout = useCallback((message) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
      console.log("Cleared errorTimeoutRef");
    }
    setErrorMessage(message);
    if (message) {
      console.log("Setting error message:", message, "with 5s timeout");
      errorTimeoutRef.current = setTimeout(() => {
        setErrorMessage("");
        console.log("Cleared errorMessage after 5s timeout");
        if (
          message ===
          "Failed to connect to the avatar after multiple attempts. Please check your network/refresh or try again later."
        ) {
          console.log("Refreshing page due to connection failure");
          window.location.reload();
        }
      }, 5000);
    }
  }, []);

  const speakNext = useCallback(
    (text, endingSilenceMs = 0, skipUpdatingChatHistory = false) => {
      return new Promise((resolve, reject) => {
        if (!avatarSynthesizer.current) {
          console.error("avatarSynthesizer is null, cannot speak");
          setErrorMessageWithTimeout("Speech synthesizer not initialized.");
          setIsSpeaking(false);
          reject(new Error("avatarSynthesizer is null"));
          return;
        }

        let ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'><voice name='${
          sttTtsConfig.ttsVoice
        }'><mstts:ttsembedding speakerProfileId='${
          sttTtsConfig.personalVoiceSpeakerProfileID
        }'><mstts:leadingsilence-exact value='0'/>${htmlEncode(
          text
        )}</mstts:ttsembedding></voice></speak>`;
        if (endingSilenceMs > 0) {
          ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'><voice name='${
            sttTtsConfig.ttsVoice
          }'><mstts:ttsembedding speakerProfileId='${
            sttTtsConfig.personalVoiceSpeakerProfileID
          }'><mstts:leadingsilence-exact value='0'/>${htmlEncode(
            text
          )}<break time='${endingSilenceMs}ms' /></mstts:ttsembedding></voice></speak>`;
        }

        console.log("speakNext called for:", text, "isSpeaking:", isSpeaking, "avatarSynthesizer state:", avatarSynthesizer.current ? "initialized" : "null");
        setIsSpeaking(true);
        speakingText.current = text;
        lastSpeakTime.current = new Date();
        avatarSynthesizer.current
          .speakSsmlAsync(ssml)
          .then((result) => {
            if (
              result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted
            ) {
              console.log(
                `Speech synthesized for text [${text}]. Result ID: ${result.resultId}`
              );
            } else {
              console.error(`Error speaking SSML. Result ID: ${result.resultId}`);
              setErrorMessageWithTimeout("Failed to synthesize speech.");
            }
            speakingText.current = "";
            if (spokenTextQueue.current.length > 0) {
              const nextText = spokenTextQueue.current.shift();
              console.log("Processing next in spokenTextQueue:", nextText);
              speakNext(nextText).then(resolve).catch(reject);
            } else {
              setIsSpeaking(false);
              console.log("speakNext completed, isSpeaking set to false");
              const textarea = document.getElementById("userMessageBox");
              if (textarea) textarea.value = "";
              resolve();
            }
          })
          .catch((error) => {
            console.error(`Error speaking SSML: ${error}`);
            setErrorMessageWithTimeout("Error synthesizing speech.");
            speakingText.current = "";
            setIsSpeaking(false);
            console.log("speakNext error, isSpeaking set to false");
            if (spokenTextQueue.current.length > 0) {
              const nextText = spokenTextQueue.current.shift();
              console.log("Processing next in spokenTextQueue after error:", nextText);
              speakNext(nextText).then(resolve).catch(reject);
            } else {
              const textarea = document.getElementById("userMessageBox");
              if (textarea) textarea.value = "";
              reject(error);
            }
          });
      });
    },
    [sttTtsConfig, isSpeaking, setErrorMessageWithTimeout]
  );

  const speak = useCallback(
    (text, endingSilenceMs = 0) => {
      console.log("speak called for:", text, "isSpeaking:", isSpeaking);
      if (isSpeaking) {
        spokenTextQueue.current.push(text);
        console.log("Pushed to spokenTextQueue:", spokenTextQueue.current);
        return new Promise((resolve) => {
          const checkQueue = () => {
            if (!isSpeaking && spokenTextQueue.current[0] === text) {
              resolve(speakNext(text, endingSilenceMs));
            } else {
              setTimeout(checkQueue, 100);
            }
          };
          checkQueue();
        });
      }
      return speakNext(text, endingSilenceMs);
    },
    [isSpeaking, speakNext]
  );

  const stopSpeaking = useCallback(() => {
    console.log("Stop speaking clicked, isSpeaking:", isSpeaking, "avatarSynthesizer state:", avatarSynthesizer.current ? "initialized" : "null");
    lastInteractionTime.current = new Date();
    spokenTextQueue.current = [];
    responseQueue.current = [];
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
      console.log("Cleared messageTimeoutRef in stopSpeaking");
    }
    setAssistantMessages("");
    console.log("Cleared assistantMessages in stopSpeaking");
    if (!avatarSynthesizer.current) {
      console.warn("avatarSynthesizer is null, cannot stop speaking");
      setIsSpeaking(false);
      return Promise.resolve();
    }
    return avatarSynthesizer.current
      .stopSpeakingAsync()
      .then(() => {
        setIsSpeaking(false);
        console.log("Stop speaking request sent, isSpeaking set to false");
        const textarea = document.getElementById("userMessageBox");
        if (textarea) textarea.value = "";
      })
      .catch((error) => {
        console.error(`Error stopping speaking: ${error}`);
        setErrorMessageWithTimeout("Error stopping speech.");
        setIsSpeaking(false);
        console.log("Stop speaking error, isSpeaking set to false");
        const textarea = document.getElementById("userMessageBox");
        if (textarea) textarea.value = "";
        throw error;
      });
  }, [isSpeaking, setErrorMessageWithTimeout]);

  const processResponseQueue = useCallback(async () => {
    console.log("processResponseQueue called, queue:", responseQueue.current, "isProcessingQueue:", isProcessingQueue.current);
    if (isProcessingQueue.current || responseQueue.current.length === 0) {
      console.log("processResponseQueue skipped due to isProcessingQueue or empty queue");
      return;
    }
    isProcessingQueue.current = true;
    const response = responseQueue.current.shift();
    console.log("Processing response:", response);

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
      console.log("Cleared messageTimeoutRef");
    }

    setAssistantMessages((prev) => {
      const newMessage = `<div class="flex justify-start mb-2"><div class="text-[#000000] px-6 py-5 rounded-3xl max-w-[90%] shadow-sm text-xl leading-relaxed font-bold">${response.replace(
        /\n/g,
        ""
      )}</div></div>`;
      console.log("Appending to assistantMessages:", response);
      return prev + newMessage;
    });
    const assistantMessagesDiv = document.getElementById("assistantMessages");
    if (assistantMessagesDiv) assistantMessagesDiv.scrollTop = assistantMessagesDiv.scrollHeight;

    try {
      await speak(response);
      console.log("Speech completed for:", response);
    } catch (error) {
      console.error("Speech error in processResponseQueue:", error);
      setErrorMessageWithTimeout("Failed to synthesize speech.");
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    isProcessingQueue.current = false;
    console.log("isProcessingQueue set to false, remaining queue:", responseQueue.current);
    if (responseQueue.current.length > 0) {
      console.log("Processing next response in queue");
      processResponseQueue();
    } else {
      messageTimeoutRef.current = setTimeout(() => {
        setAssistantMessages("");
        console.log("Cleared assistantMessages after 5.5s timeout");
      }, 5500);
    }
  }, [speak, setErrorMessageWithTimeout]);

  const handleUserQuery = useCallback(
    async (userQuery, userQueryHTML, imgUrlPath) => {
      console.log("Handling user query:", userQuery);
      lastInteractionTime.current = new Date();
      let contentMessage = userQuery;
      if (imgUrlPath.trim()) {
        contentMessage = [
          { type: "text", text: userQuery },
          { type: "image_url", image_url: { url: imgUrlPath } },
        ];
      }
      messages.current.push({ role: "user", content: contentMessage });
      setChatHistory(
        (prev) =>
          `<div class="flex justify-end mb-2"><div class="bg-blue-100 text-gray-800 p-3 rounded-lg max-w-[80%]">${userQueryHTML}</div></div>${prev}`
      );
      const chatHistoryDiv = document.getElementById("chatHistory");
      if (chatHistoryDiv) chatHistoryDiv.scrollTop = 0;

      if (isSpeaking) {
        await stopSpeaking();
      }

      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
        console.log("Cleared messageTimeoutRef in handleUserQuery");
      }
      setAssistantMessages("");
      console.log("Cleared assistantMessages in handleUserQuery");

      if (dataSources.current.length > 0 && enableQuickReply) {
        speak(getQuickReply(), 2000);
      }

      const url =
        dataSources.current.length > 0
          ? `${openAIConfig.endpoint}/openai/deployments/${openAIConfig.deploymentName}/extensions/chat/completions?api-version=2023-06-01-preview`
          : `${openAIConfig.endpoint}/openai/deployments/${openAIConfig.deploymentName}/chat/completions?api-version=2023-06-01-preview`;
      const body = JSON.stringify({
        dataSources:
          dataSources.current.length > 0 ? dataSources.current : undefined,
        messages: messages.current,
        stream: true,
      });

      let assistantReply = "";
      let toolContent = "";

      fetch(url, {
        method: "POST",
        headers: {
          "api-key": openAIConfig.apiKey,
          "Content-Type": "application/json",
        },
        body,
      })
        .then((response) => {
          if (!response.ok) {
            console.error(
              `Chat API response status: ${response.status} ${response.statusText}`
            );
            setErrorMessageWithTimeout(
              `Failed to connect to OpenAI API: ${response.status} ${response.statusText}`
            );
            return;
          }
          const reader = response.body.getReader();
          const read = (previousChunkString = "") => {
            return reader.read().then(({ value, done }) => {
              if (done) {
                if (assistantReply) {
                  responseQueue.current.push(assistantReply);
                  console.log("Pushed to responseQueue:", assistantReply, "Queue:", responseQueue.current);
                  messages.current.push({
                    role: "assistant",
                    content: assistantReply,
                  });
                  isProcessingQueue.current = false;
                  processResponseQueue();
                }
                if (dataSources.current.length > 0 && toolContent) {
                  messages.current.push({ role: "tool", content: toolContent });
                }
                console.log(
                  "Stream completed. Final assistant reply:",
                  assistantReply
                );
                return;
              }
              let chunkString = new TextDecoder().decode(value, {
                stream: true,
              });
              if (previousChunkString)
                chunkString = previousChunkString + chunkString;
              if (
                !chunkString.endsWith("}\n\n") &&
                !chunkString.endsWith("[DONE]\n\n")
              )
                return read(chunkString);

              chunkString.split("\n\n").forEach((line) => {
                if (line.startsWith("data:") && !line.endsWith("[DONE]")) {
                  try {
                    const responseJson = JSON.parse(line.substring(5).trim());
                    let responseToken =
                      dataSources.current.length === 0
                        ? responseJson.choices?.[0]?.delta?.content
                        : responseJson.choices?.[0]?.messages?.[0]?.delta
                            ?.content;
                    if (responseToken) {
                      if (byodDocRegex.test(responseToken)) {
                        responseToken = responseToken
                          .replace(byodDocRegex, "")
                          .trim();
                      }
                      if (responseToken === "[DONE]") responseToken = undefined;
                    }
                    if (responseToken) {
                      assistantReply += responseToken;
                      console.log("Streamed token:", responseToken);
                    }
                  } catch (error) {
                    console.error(
                      `Error parsing response: ${error}, chunk: ${line}`
                    );
                    setErrorMessageWithTimeout("Error processing API response.");
                  }
                }
              });
              return read();
            });
          };
          return read();
        })
        .catch((error) => {
          console.error(`Fetch error: ${error}`);
          setErrorMessageWithTimeout("Failed to connect to OpenAI API.");
        });
    },
    [openAIConfig, isSpeaking, stopSpeaking, speak, enableOyd, setErrorMessageWithTimeout]
  );

  const getQuickReply = useCallback(
    () => quickReplies[Math.floor(Math.random() * quickReplies.length)],
    []
  );

  const initMessages = useCallback(() => {
    messages.current = [];
    if (dataSources.current.length === 0) {
      messages.current.push({ role: "system", content: prompt });
    }
  }, [prompt]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkHung();
      checkLastSpeak();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const remoteVideoDiv = document.getElementById("remoteVideo");
    if (remoteVideoDiv && sessionActive) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          console.log("remoteVideo DOM changed:", mutation);
          if (
            !document.getElementById("videoPlayer") &&
            peerConnection.current
              ?.getReceivers()
              .some((r) => r.track.kind === "video")
          ) {
            console.warn("Video element removed, re-adding...");
            const stream = peerConnection.current
              .getReceivers()
              .find((r) => r.track.kind === "video")?.track?.stream;
            if (stream) {
              const videoElement = document.createElement("video");
              videoElement.id = "videoPlayer";
              videoElement.srcObject = stream;
              videoElement.autoplay = true;
              videoElement.playsInline = true;
              videoElement.style.width = "450px";
              videoElement.style.height = "300px";
              videoElement.style.background = "transparent";
              videoElement.style.backgroundColor = "transparent";
              remoteVideoDiv.appendChild(videoElement);
              console.log("Video element re-added to DOM", {
                background: videoElement.style.background,
                backgroundColor: videoElement.style.backgroundColor
              });
            }
          }
        });
      });
      observer.observe(remoteVideoDiv, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [sessionActive]);

  const disconnectAvatar = useCallback(() => {
    console.log("Disconnecting avatar...");
    if (avatarSynthesizer.current) {
      avatarSynthesizer.current.close();
      avatarSynthesizer.current = null;
    }
    if (speechRecognizer.current) {
      speechRecognizer.current.stopContinuousRecognitionAsync();
      speechRecognizer.current.close();
      speechRecognizer.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setSessionActive(false);
    hasWelcomed.current = false; // Reset for new session
    console.log("Avatar disconnected");
  }, []);

  const connectAvatar = useCallback(
    (retryCallback = () => {}, initialQuery = null) => {
      console.log(
        `Starting avatar connection (Attempt ${
          retryCount.current + 1
        }/${maxRetries})... initialQuery:`, initialQuery
      );
      console.log("speechConfig:", {
        apiKey: speechConfig.apiKey ? "[REDACTED]" : "",
        region: speechConfig.region,
        enablePrivateEndpoint: speechConfig.enablePrivateEndpoint,
        privateEndpoint: speechConfig.privateEndpoint
      });
      console.log("openAIConfig:", {
        endpoint: openAIConfig.endpoint,
        apiKey: openAIConfig.apiKey ? "[REDACTED]" : "",
        deploymentName: openAIConfig.deploymentName
      });
      console.log("sttTtsConfig:", {
        ttsVoice: sttTtsConfig.ttsVoice,
        personalVoiceSpeakerProfileID: sttTtsConfig.personalVoiceSpeakerProfileID,
        customVoiceEndpointId: sttTtsConfig.customVoiceEndpointId,
        sttLocales: sttTtsConfig.sttLocales
      });
      console.log("avatarConfig:", avatarConfig);
      showLoadingPopup();

      if (speechConfig.apiKey === "") {
        console.error("speechConfig.apiKey is empty");
        showErrorPopup("Surgeon is a little busy.\nPlease try again later, you will be redirected to home screen in 5 secs.");
        retryCount.current = 0;
        setTimeout(() => window.location.assign("/home"), 5000);
        return;
      }
      if (
        speechConfig.enablePrivateEndpoint &&
        speechConfig.privateEndpoint === ""
      ) {
        console.error("speechConfig.privateEndpoint is empty when enablePrivateEndpoint is true");
        showErrorPopup("Surgeon is a little busy.\nPlease try again later, you will be redirected to home screen in 5 secs.");
        retryCount.current = 0;
        setTimeout(() => window.location.assign("/home"), 5000);
        return;
      }
      if (
        openAIConfig.endpoint === "" ||
        openAIConfig.apiKey === "" ||
        openAIConfig.deploymentName === ""
      ) {
        console.error("Invalid openAIConfig:", openAIConfig);
        showErrorPopup(
          "Surgeon is a little busy.\nPlease try again later, you will be redirected to home screen in 5 secs."
        );
        retryCount.current = 0;
        setTimeout(() => window.location.assign("/home"), 5000);
        return;
      }
      if (
        enableOyd &&
        (cogSearchConfig.endpoint === "" ||
          cogSearchConfig.apiKey === "" ||
          cogSearchConfig.indexName === "")
      ) {
        console.error("Invalid cogSearchConfig:", cogSearchConfig);
        showErrorPopup(
          "Surgeon is a little busy.\nPlease try again later, you will be redirected to home screen in 5 secs."
        );
        retryCount.current = 0;
        setTimeout(() => window.location.assign("/home"), 5000);
        return;
      }

      let speechSynthesisConfig;
      if (speechConfig.enablePrivateEndpoint) {
        speechSynthesisConfig = SpeechSDK.SpeechConfig.fromEndpoint(
          new URL(
            `wss://${speechConfig.privateEndpoint.slice(
              8
            )}/tts/cognitiveservices/websocket/v1?enableTalkingAvatar=true`
          ),
          speechConfig.apiKey
        );
      } else {
        speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(
          speechConfig.apiKey,
          speechConfig.region
        );
      }
      speechSynthesisConfig.endpointId = sttTtsConfig.customVoiceEndpointId;
      console.log("speechSynthesisConfig initialized:", {
        region: speechConfig.region,
        endpointId: sttTtsConfig.customVoiceEndpointId
      });

      const avatarSdkConfig = new SpeechSDK.AvatarConfig(
        avatarConfig.character,
        avatarConfig.style,
        {
          customized: avatarConfig.customized,
          transparentBackground: true
        }
      );
      console.log("avatarSdkConfig initialized:", {
        character: avatarConfig.character,
        style: avatarConfig.style,
        customized: avatarConfig.customized,
        transparentBackground: true
      });

      avatarSynthesizer.current = new SpeechSDK.AvatarSynthesizer(
        speechSynthesisConfig,
        avatarSdkConfig
      );
      avatarSynthesizer.current.avatarEventReceived = (s, e) => {
        console.log(
          `Avatar event received: ${e.description}, offset: ${e.offset / 10000}ms`
        );
      };
      console.log("avatarSynthesizer initialized");

      const speechRecognitionConfig = SpeechSDK.SpeechConfig.fromEndpoint(
        new URL(
          `wss://${speechConfig.region}.stt.speech.microsoft.com/speech/universal/v2`
        ),
        speechConfig.apiKey
      );
      speechRecognitionConfig.setProperty(
        SpeechSDK.PropertyId.SpeechServiceConnection_LanguageIdMode,
        "Continuous"
      );
      const autoDetectSourceLanguageConfig =
        SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(
          sttTtsConfig.sttLocales.split(",")
        );
      speechRecognizer.current = SpeechSDK.SpeechRecognizer.FromConfig(
        speechRecognitionConfig,
        autoDetectSourceLanguageConfig,
        SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()
      );
      console.log("speechRecognizer initialized");

      if (!messageInitiated.current) {
        initMessages();
        messageInitiated.current = true;
      }

      const xhr = new XMLHttpRequest();
      const url = speechConfig.enablePrivateEndpoint
        ? `https://${speechConfig.privateEndpoint.slice(
            8
          )}/tts/cognitiveservices/avatar/relay/token/v1`
        : `https://${speechConfig.region}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`;
      xhr.open("GET", url);
      xhr.setRequestHeader("Ocp-Apim-Subscription-Key", speechConfig.apiKey);
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            console.log("WebRTC token fetched successfully");
            const responseData = JSON.parse(this.responseText);
            setupWebRTC(
              responseData.Urls[0],
              responseData.Username,
              responseData.Password,
              retryCallback,
              initialQuery
            );
          } else {
            retryCount.current += 1;
            console.error(
              `WebRTC token fetch failed: ${this.status} ${this.statusText}`
            );
            if (retryCount.current >= maxRetries) {
              showErrorPopup(
                "Surgeon is a little busy.\nPlease try again later, you will be redirected to home screen in 5 secs."
              );
              retryCount.current = 0;
              console.error(
                `Failed to fetch WebRTC token after ${maxRetries} attempts: ${this.status} ${this.statusText}`
              );
              setTimeout(() => window.location.assign("/home"), 5000);
            } else {
              setTimeout(() => {
                disconnectAvatar();
                connectAvatar(retryCallback, initialQuery);
              }, 2000);
            }
          }
        }
      };
      xhr.send();
      console.log("WebRTC token request sent:", url);
    },
    [
      speechConfig,
      openAIConfig,
      cogSearchConfig,
      enableOyd,
      sttTtsConfig,
      avatarConfig,
      disconnectAvatar,
      showLoadingPopup,
      showErrorPopup,
      initMessages
    ]
  );

  const setupWebRTC = useCallback(
    (iceServerUrl, iceServerUsername, iceServerCredential, retryCallback, initialQuery = null) => {
      console.log("Setting up WebRTC with ICE server:", iceServerUrl, "initialQuery:", initialQuery);
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          {
            urls: [iceServerUrl],
            username: iceServerUsername,
            credential: iceServerCredential,
          },
        ],
      });

      peerConnection.current.ontrack = (event) => {
        const remoteVideoDiv = document.getElementById("remoteVideo");
        if (!remoteVideoDiv) {
          console.error("remoteVideo div not found");
          setErrorMessageWithTimeout("Video container not found in DOM.");
          return;
        }
        if (event.track.kind === "audio") {
          if (!document.getElementById("audioPlayer")) {
            const audioElement = document.createElement("audio");
            audioElement.id = "audioPlayer";
            audioElement.srcObject = event.streams[0];
            audioElement.autoplay = true;
            audioElement.onplay = () => console.log("Audio playback started");
            audioElement.onerror = (e) =>
              console.error("Audio element error:", e);
            remoteVideoDiv.appendChild(audioElement);
            console.log("Audio element added to DOM");
          }
        } else if (event.track.kind === "video") {
          console.log("Video track received:", event.track);
          if (!document.getElementById("videoPlayer")) {
            const videoElement = document.createElement("video");
            videoElement.id = "videoPlayer";
            videoElement.srcObject = event.streams[0];
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            videoElement.style.width = "450px";
            videoElement.style.height = "300px";
            videoElement.style.background = "transparent";
            videoElement.style.backgroundColor = "rgba(0,0,0,0)";
            remoteVideoDiv.appendChild(videoElement);
            console.log("Video element added to DOM with transparent background");
            console.log("Video stream:", event.streams[0]);
            const videoTrack = event.streams[0].getVideoTracks()[0];
            console.log("Video track settings:", videoTrack.getSettings());
          }
        }
      };

      peerConnection.current.addEventListener("datachannel", (event) => {
        peerConnectionDataChannel.current = event.channel;
        peerConnectionDataChannel.current.onmessage = (e) => {
          const webRTCEvent = JSON.parse(e.data);
          if (showSubtitles) {
            const subtitles = document.getElementById("subtitles");
            if (!subtitles) {
              console.warn("Subtitles element not found");
              return;
            }
            if (webRTCEvent.event.eventType === "EVENT_TYPE_TURN_START") {
              subtitles.hidden = false;
              subtitles.innerHTML = speakingText.current;
            } else if (
              webRTCEvent.event.eventType === "EVENT_TYPE_SESSION_END" ||
              webRTCEvent.event.eventType === "EVENT_TYPE_SWITCH_TO_IDLE"
            ) {
              subtitles.hidden = true;
            }
          }
          console.log(`WebRTC event: ${e.data}`);
        };
      });

      peerConnection.current.oniceconnectionstatechange = () => {
        console.log(
          `WebRTC status: ${peerConnection.current.iceConnectionState}`
        );
        if (peerConnection.current.iceConnectionState === "failed") {
          retryCount.current += 1;
          if (retryCount.current >= maxRetries) {
            showErrorPopup(
              "Surgeon is a little busy.\nPlease try again later, you will be redirected to home screen in 5 secs."
            );
            retryCount.current = 0;
            console.error(`WebRTC connection failed after ${maxRetries} attempts`);
            setTimeout(() => window.location.assign("/home"), 5000);
          } else {
            setTimeout(() => {
              disconnectAvatar();
              connectAvatar(retryCallback, initialQuery);
            }, 2000);
          }
        }
      };

      peerConnection.current.createDataChannel("eventChannel");
      peerConnection.current.addTransceiver("video", { direction: "sendrecv" });
      peerConnection.current.addTransceiver("audio", { direction: "sendrecv" });

      avatarSynthesizer.current
        .startAvatarAsync(peerConnection.current)
        .then((r) => {
          if (r.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            console.log(`Avatar started. Result ID: ${r.resultId}`);
            retryCount.current = 0;
            setSessionActive(true);
            clearPopup();

            // Handle welcome message or initial query
            if (!initialQuery && !hasWelcomed.current) {
              const welcomeMessage = "Hi, I am your surgeon. How can I help you today?";
              console.log("Triggering welcome message:", welcomeMessage);
              responseQueue.current.push(welcomeMessage);
              processResponseQueue();
              hasWelcomed.current = true;
            } else if (initialQuery) {
              console.log("Triggering initial query:", initialQuery);
              handleUserQuery(initialQuery, initialQuery, "");
            }
          } else {
            console.error(`Unable to start avatar. Result ID: ${r.resultId}`);
            retryCount.current += 1;
            if (retryCount.current >= maxRetries) {
              showErrorPopup(
                "Surgeon is a little busy.\nPlease try again later, you will be redirected to home screen in 5 secs."
              );
              retryCount.current = 0;
              console.error(
                `Avatar failed to start after ${maxRetries} attempts. Result ID: ${r.resultId}`
              );
              setTimeout(() => window.location.assign("/home"), 5000);
            } else {
              setTimeout(() => {
                disconnectAvatar();
                retryCallback();
              }, 2000);
            }
          }
        })
        .catch((error) => {
          console.error(`Avatar failed to start: ${error}`);
          retryCount.current += 1;
          if (retryCount.current >= maxRetries) {
            showErrorPopup(
              "Surgeon is a little busy.\nPlease try again later, you will be redirected to home screen in 5 secs."
            );
            retryCount.current = 0;
            console.error(
              `Avatar failed to start after ${maxRetries} attempts: ${error}`
            );
            setTimeout(() => window.location.assign("/home"), 5000);
          } else {
            setTimeout(() => {
              disconnectAvatar();
              retryCallback();
            }, 2000);
          }
        });
    },
    [
      showSubtitles,
      disconnectAvatar,
      clearPopup,
      showErrorPopup,
      handleUserQuery,
      processResponseQueue
    ]
  );

  const checkHung = useCallback(() => {
    const videoElement = document.getElementById("videoPlayer");
    if (videoElement && sessionActive) {
      const videoTime = videoElement.currentTime;
      setTimeout(() => {
        if (
          videoElement.currentTime === videoTime &&
          sessionActive &&
          autoReconnectAvatar &&
          new Date() - lastInteractionTime.current < 300000
        ) {
          console.log("Video stream disconnected, reconnecting...");
          isReconnecting.current = true;
          disconnectAvatar();
          connectAvatar();
        }
      }, 2000);
    }
  }, [sessionActive, autoReconnectAvatar, disconnectAvatar, connectAvatar]);

  const checkLastSpeak = useCallback(() => {
    if (
      lastSpeakTime.current &&
      new Date() - lastSpeakTime.current > 15000 &&
      useLocalVideoForIdle &&
      sessionActive &&
      !isSpeaking
    ) {
      disconnectAvatar();
      document.getElementById("localVideo").hidden = false;
      document.getElementById("remoteVideo").style.width = "0.1px";
      setSessionActive(false);
    }
  }, [useLocalVideoForIdle, sessionActive, isSpeaking, disconnectAvatar]);

  const startSession = useCallback(
    (initialQuery = null) => {
      console.log("Start session clicked, initialQuery:", initialQuery);
      lastInteractionTime.current = new Date();
      if (useLocalVideoForIdle) {
        document.getElementById("localVideo").hidden = false;
        document.getElementById("remoteVideo").style.width = "0.1px";
        setSessionActive(true);
        clearPopup();
        if (initialQuery) {
          console.log("Triggering initial query for local video:", initialQuery);
          handleUserQuery(initialQuery, initialQuery, "");
        }
        return;
      }
      retryCount.current = 0;
      connectAvatar(() => connectAvatar(() => connectAvatar()), initialQuery);
    },
    [useLocalVideoForIdle, connectAvatar, clearPopup, handleUserQuery]
  );

  const stopSession = useCallback(() => {
    console.log("Stop session clicked");
    lastInteractionTime.current = new Date();
    disconnectAvatar();
    document.getElementById("localVideo").hidden = true;
    retryCount.current = 0;
  }, [disconnectAvatar]);

  const clearChatHistory = useCallback(() => {
    console.log("Clear chat history clicked");
    lastInteractionTime.current = new Date();
    setChatHistory("");
    setAssistantMessages("");
    initMessages();
  }, [initMessages]);

  const toggleMicrophone = useCallback(async () => {
    console.log("Toggle microphone clicked");
    lastInteractionTime.current = new Date();
    if (microphoneText === "Stop Microphone") {
      speechRecognizer.current.stopContinuousRecognitionAsync(
        () => {
          setMicrophoneText("Start Microphone");
          console.log("Microphone stopped");
        },
        (err) => {
          console.error(`Failed to stop recognition: ${err}`);
          setErrorMessageWithTimeout("Failed to stop microphone.");
        }
      );
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone permission granted");

      if (useLocalVideoForIdle && !sessionActive) {
        retryCount.current = 0;
        connectAvatar(() => connectAvatar(() => connectAvatar()));
        setTimeout(() => {
          const audioPlayer = document.getElementById("audioPlayer");
          if (audioPlayer)
            audioPlayer
              .play()
              .catch((e) => console.error(`Audio play error: ${e}`));
        }, 5000);
      } else {
        const audioPlayer = document.getElementById("audioPlayer");
        if (audioPlayer)
          audioPlayer
            .play()
            .catch((e) => console.error(`Audio play error: ${e}`));
      }

      speechRecognizer.current.recognizing = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
          const userQuery = e.result.text.trim();
          console.log("Speech recognizing:", userQuery);
          if (userQuery) {
            const textarea = document.getElementById("userMessageBox");
            if (textarea) {
              textarea.value = userQuery;
            }
          }
        }
      };

      speechRecognizer.current.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const userQuery = e.result.text.trim();
          console.log("Speech recognized:", userQuery);
          if (userQuery) {
            const userQueryHTML = userQuery;
            handleUserQuery(userQuery, userQueryHTML, "");
            const textarea = document.getElementById("userMessageBox");
            if (textarea) textarea.value = "";
          }
          if (!continuousConversation) {
            speechRecognizer.current.stopContinuousRecognitionAsync(
              () => {
                setMicrophoneText("Start Microphone");
                console.log("Microphone stopped after recognition");
              },
              (err) => console.error(`Failed to stop recognition: ${err}`)
            );
          }
        }
      };

      speechRecognizer.current.startContinuousRecognitionAsync(
        () => {
          setMicrophoneText("Stop Microphone");
          console.log("Microphone started");
        },
        (err) => {
          console.error(`Failed to start recognition: ${err}`);
          setErrorMessageWithTimeout("Failed to stop microphone.");
        }
      );
    } catch (err) {
      console.error(`Microphone permission error: ${err}`);
      setErrorMessageWithTimeout("Microphone access denied.");
    }
  }, [
    useLocalVideoForIdle,
    sessionActive,
    continuousConversation,
    connectAvatar,
    handleUserQuery,
    microphoneText,
    setErrorMessageWithTimeout
  ]);

  return {
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
  };
};

export default useAvatar;