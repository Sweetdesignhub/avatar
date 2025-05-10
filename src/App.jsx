// import { useState, useEffect, useRef, useCallback } from 'react';

// // Custom hook for avatar logic
// const useAvatar = ({
//     speechConfig,
//     openAIConfig,
//     cogSearchConfig,
//     sttTtsConfig,
//     avatarConfig,
//     enableOyd,
//     continuousConversation,
//     showSubtitles,
//     autoReconnectAvatar,
//     useLocalVideoForIdle,
//     prompt
// }) => {
//     const [sessionActive, setSessionActive] = useState(false);
//     const [isSpeaking, setIsSpeaking] = useState(false);
//     const [chatHistory, setChatHistory] = useState('');
//     const [errorMessage, setErrorMessage] = useState('');
//     const [microphoneText, setMicrophoneText] = useState('Start Microphone');

//     const speechRecognizer = useRef(null);
//     const avatarSynthesizer = useRef(null);
//     const peerConnection = useRef(null);
//     const peerConnectionDataChannel = useRef(null);
//     const messages = useRef([]);
//     const messageInitiated = useRef(false);
//     const dataSources = useRef([]);
//     const spokenTextQueue = useRef([]);
//     const isReconnecting = useRef(false);
//     const speakingText = useRef('');
//     const lastInteractionTime = useRef(new Date());
//     const lastSpeakTime = useRef(null);

//     const sentenceLevelPunctuations = ['.', '?', '!', ':', ';', '。', '？', '！', '：', '；'];
//     const enableDisplayTextAlignmentWithSpeech = true;
//     const enableQuickReply = false;
//     const quickReplies = ['Let me take a look.', 'Let me check.', 'One moment, please.'];
//     const byodDocRegex = new RegExp(/\[doc(\d+)\]/g);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             checkHung();
//             checkLastSpeak();
//         }, 2000);
//         return () => clearInterval(interval);
//     }, []);

//     useEffect(() => {
//         const remoteVideoDiv = document.getElementById('remoteVideo');
//         if (remoteVideoDiv && sessionActive) {
//             const observer = new MutationObserver((mutations) => {
//                 mutations.forEach((mutation) => {
//                     console.log('remoteVideo DOM changed:', mutation);
//                     if (!document.getElementById('videoPlayer') && peerConnection.current?.getReceivers().some(r => r.track.kind === 'video')) {
//                         console.warn('Video element removed, re-adding...');
//                         const stream = peerConnection.current.getReceivers().find(r => r.track.kind === 'video')?.track?.stream;
//                         if (stream) {
//                             const videoElement = document.createElement('video');
//                             videoElement.id = 'videoPlayer';
//                             videoElement.srcObject = stream;
//                             videoElement.autoplay = true;
//                             videoElement.playsInline = true;
//                             videoElement.style.width = '960px';
//                             videoElement.style.height = '540px';
//                             remoteVideoDiv.appendChild(videoElement);
//                             console.log('Video element re-added to DOM');
//                         }
//                     }
//                 });
//             });
//             observer.observe(remoteVideoDiv, { childList: true, subtree: true });
//             return () => observer.disconnect();
//         }
//     }, [sessionActive]);

//     const connectAvatar = useCallback(() => {
//         console.log('Starting avatar connection...');
//         setErrorMessage('');
//         if (speechConfig.apiKey === '') {
//             setErrorMessage('Please fill in the API key of your speech resource.');
//             return;
//         }
//         if (speechConfig.enablePrivateEndpoint && speechConfig.privateEndpoint === '') {
//             setErrorMessage('Please fill in the Azure Speech endpoint.');
//             return;
//         }
//         if (openAIConfig.endpoint === '' || openAIConfig.apiKey === '' || openAIConfig.deploymentName === '') {
//             setErrorMessage('Please fill in the Azure OpenAI endpoint, API key, and deployment name.');
//             return;
//         }
//         if (enableOyd && (cogSearchConfig.endpoint === '' || cogSearchConfig.apiKey === '' || cogSearchConfig.indexName === '')) {
//             setErrorMessage('Please fill in the Azure Cognitive Search endpoint, API key, and index name.');
//             return;
//         }

//         let speechSynthesisConfig;
//         if (speechConfig.enablePrivateEndpoint) {
//             speechSynthesisConfig = SpeechSDK.SpeechConfig.fromEndpoint(new URL(`wss://${speechConfig.privateEndpoint.slice(8)}/tts/cognitiveservices/websocket/v1?enableTalkingAvatar=true`), speechConfig.apiKey);
//         } else {
//             speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(speechConfig.apiKey, speechConfig.region);
//         }
//         speechSynthesisConfig.endpointId = sttTtsConfig.customVoiceEndpointId;

//         const avatarSdkConfig = new SpeechSDK.AvatarConfig(avatarConfig.character, avatarConfig.style);
//         avatarSdkConfig.customized = avatarConfig.customized;
//         avatarSynthesizer.current = new SpeechSDK.AvatarSynthesizer(speechSynthesisConfig, avatarSdkConfig);
//         avatarSynthesizer.current.avatarEventReceived = (s, e) => {
//             console.log(`Avatar event received: ${e.description}, offset: ${e.offset / 10000}ms`);
//         };

//         const speechRecognitionConfig = SpeechSDK.SpeechConfig.fromEndpoint(new URL(`wss://${speechConfig.region}.stt.speech.microsoft.com/speech/universal/v2`), speechConfig.apiKey);
//         speechRecognitionConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_LanguageIdMode, "Continuous");
//         const autoDetectSourceLanguageConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(sttTtsConfig.sttLocales.split(','));
//         speechRecognizer.current = SpeechSDK.SpeechRecognizer.FromConfig(speechRecognitionConfig, autoDetectSourceLanguageConfig, SpeechSDK.AudioConfig.fromDefaultMicrophoneInput());

//         if (!messageInitiated.current) {
//             initMessages();
//             messageInitiated.current = true;
//         }

//         const xhr = new XMLHttpRequest();
//         const url = speechConfig.enablePrivateEndpoint
//             ? `https://${speechConfig.privateEndpoint.slice(8)}/tts/cognitiveservices/avatar/relay/token/v1`
//             : `https://${speechConfig.region}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`;
//         xhr.open("GET", url);
//         xhr.setRequestHeader("Ocp-Apim-Subscription-Key", speechConfig.apiKey);
//         xhr.onreadystatechange = function () {
//             if (this.readyState === 4) {
//                 if (this.status === 200) {
//                     const responseData = JSON.parse(this.responseText);
//                     setupWebRTC(responseData.Urls[0], responseData.Username, responseData.Password);
//                 } else {
//                     setErrorMessage(`Failed to fetch WebRTC token: ${this.status} ${this.statusText}`);
//                 }
//             }
//         };
//         xhr.send();
//         console.log('WebRTC token request sent:', url);
//     }, [speechConfig, openAIConfig, cogSearchConfig, enableOyd, sttTtsConfig, avatarConfig]);

//     const disconnectAvatar = useCallback(() => {
//         console.log('Disconnecting avatar...');
//         if (avatarSynthesizer.current) {
//             avatarSynthesizer.current.close();
//             avatarSynthesizer.current = null;
//         }
//         if (speechRecognizer.current) {
//             speechRecognizer.current.stopContinuousRecognitionAsync();
//             speechRecognizer.current.close();
//             speechRecognizer.current = null;
//         }
//         if (peerConnection.current) {
//             peerConnection.current.close();
//             peerConnection.current = null;
//         }
//         setSessionActive(false);
//         console.log('Avatar disconnected');
//     }, []);

//     const setupWebRTC = useCallback((iceServerUrl, iceServerUsername, iceServerCredential) => {
//         console.log('Setting up WebRTC with ICE server:', iceServerUrl);
//         peerConnection.current = new RTCPeerConnection({
//             iceServers: [{ urls: [iceServerUrl], username: iceServerUsername, credential: iceServerCredential }],
//         });

//         peerConnection.current.ontrack = (event) => {
//             const remoteVideoDiv = document.getElementById('remoteVideo');
//             if (!remoteVideoDiv) {
//                 console.error('remoteVideo div not found');
//                 setErrorMessage('Video container not found in DOM.');
//                 return;
//             }
//             if (event.track.kind === 'audio') {
//                 if (!document.getElementById('audioPlayer')) {
//                     const audioElement = document.createElement('audio');
//                     audioElement.id = 'audioPlayer';
//                     audioElement.srcObject = event.streams[0];
//                     audioElement.autoplay = true;
//                     audioElement.onplay = () => console.log('Audio playback started');
//                     audioElement.onerror = (e) => console.error('Audio element error:', e);
//                     remoteVideoDiv.appendChild(audioElement);
//                     console.log('Audio element added to DOM');
//                 }
//             } else if (event.track.kind === 'video') {
//                 if (!document.getElementById('videoPlayer')) {
//                     const videoElement = document.createElement('video');
//                     videoElement.id = 'videoPlayer';
//                     videoElement.srcObject = event.streams[0];
//                     videoElement.autoplay = true;
//                     videoElement.playsInline = true;
//                     videoElement.style.width = '960px';
//                     videoElement.style.height = '540px';
//                     videoElement.onloadedmetadata = () => console.log('Video metadata loaded');
//                     videoElement.onplay = () => console.log('Video playback started');
//                     videoElement.onerror = (e) => console.error('Video element error:', e);
//                     remoteVideoDiv.appendChild(videoElement);
//                     console.log('Video element added to DOM');
//                     setSessionActive(true);
//                 }
//             }
//         };

//         peerConnection.current.addEventListener("datachannel", (event) => {
//             peerConnectionDataChannel.current = event.channel;
//             peerConnectionDataChannel.current.onmessage = (e) => {
//                 const webRTCEvent = JSON.parse(e.data);
//                 const subtitles = document.getElementById('subtitles');
//                 if (webRTCEvent.event.eventType === 'EVENT_TYPE_TURN_START' && showSubtitles) {
//                     subtitles.hidden = false;
//                     subtitles.innerHTML = speakingText.current;
//                 } else if (webRTCEvent.event.eventType === 'EVENT_TYPE_SESSION_END' || webRTCEvent.event.eventType === 'EVENT_TYPE_SWITCH_TO_IDLE') {
//                     subtitles.hidden = true;
//                 }
//                 console.log(`WebRTC event: ${e.data}`);
//             };
//         });

//         peerConnection.current.oniceconnectionstatechange = () => {
//             console.log(`WebRTC status: ${peerConnection.current.iceConnectionState}`);
//             if (peerConnection.current.iceConnectionState === 'failed') {
//                 setErrorMessage('WebRTC connection failed. Check network or firewall settings.');
//             }
//         };

//         peerConnection.current.createDataChannel("eventChannel");
//         peerConnection.current.addTransceiver('video', { direction: 'sendrecv' });
//         peerConnection.current.addTransceiver('audio', { direction: 'sendrecv' });

//         avatarSynthesizer.current.startAvatarAsync(peerConnection.current).then((r) => {
//             if (r.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
//                 console.log(`Avatar started. Result ID: ${r.resultId}`);
//             } else {
//                 console.error(`Unable to start avatar. Result ID: ${r.resultId}`);
//                 setErrorMessage('Avatar failed to start. Check console for details.');
//             }
//         }).catch((error) => {
//             console.error(`Avatar failed to start: ${error}`);
//             setErrorMessage('Failed to start avatar. Check console for details.');
//         });
//     }, [showSubtitles]);

//     const initMessages = useCallback(() => {
//         messages.current = [];
//         if (dataSources.current.length === 0) {
//             messages.current.push({ role: 'system', content: prompt });
//         }
//     }, [prompt]);

//     const htmlEncode = (text) => {
//         const entityMap = { '&': '&', '<': '<', '>': '>', '"': '"', "'": '', '/': '/' };
//         return String(text).replace(/[&<>"'\/]/g, (match) => entityMap[match]);
//     };

//     const speak = useCallback((text, endingSilenceMs = 0) => {
//         if (isSpeaking) {
//             spokenTextQueue.current.push(text);
//             return;
//         }
//         speakNext(text, endingSilenceMs);
//     }, [isSpeaking]);

//     const speakNext = useCallback((text, endingSilenceMs = 0, skipUpdatingChatHistory = false) => {
//         let ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'><voice name='${sttTtsConfig.ttsVoice}'><mstts:ttsembedding speakerProfileId='${sttTtsConfig.personalVoiceSpeakerProfileID}'><mstts:leadingsilence-exact value='0'/>${htmlEncode(text)}</mstts:ttsembedding></voice></speak>`;
//         if (endingSilenceMs > 0) {
//             ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'><voice name='${sttTtsConfig.ttsVoice}'><mstts:ttsembedding speakerProfileId='${sttTtsConfig.personalVoiceSpeakerProfileID}'><mstts:leadingsilence-exact value='0'/>${htmlEncode(text)}<break time='${endingSilenceMs}ms' /></mstts:ttsembedding></voice></speak>`;
//         }

//         if (enableDisplayTextAlignmentWithSpeech && !skipUpdatingChatHistory) {
//             setChatHistory((prev) => prev + text.replace(/\n/g, '<br/>'));
//             const chatHistoryDiv = document.getElementById('chatHistory');
//             if (chatHistoryDiv) chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
//         }

//         setIsSpeaking(true);
//         speakingText.current = text;
//         lastSpeakTime.current = new Date();
//         avatarSynthesizer.current.speakSsmlAsync(ssml).then((result) => {
//             if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
//                 console.log(`Speech synthesized for text [${text}]. Result ID: ${result.resultId}`);
//             } else {
//                 console.error(`Error speaking SSML. Result ID: ${result.resultId}`);
//                 setErrorMessage('Failed to synthesize speech.');
//             }
//             speakingText.current = '';
//             if (spokenTextQueue.current.length > 0) {
//                 speakNext(spokenTextQueue.current.shift());
//             } else {
//                 setIsSpeaking(false);
//             }
//         }).catch((error) => {
//             console.error(`Error speaking SSML: ${error}`);
//             setErrorMessage('Error synthesizing speech.');
//             speakingText.current = '';
//             if (spokenTextQueue.current.length > 0) {
//                 speakNext(spokenTextQueue.current.shift());
//             } else {
//                 setIsSpeaking(false);
//             }
//         });
//     }, [sttTtsConfig]);

//     const stopSpeaking = useCallback(() => {
//         console.log('Stop speaking clicked');
//         lastInteractionTime.current = new Date();
//         spokenTextQueue.current = [];
//         avatarSynthesizer.current.stopSpeakingAsync().then(() => {
//             setIsSpeaking(false);
//             console.log("Stop speaking request sent.");
//         }).catch((error) => {
//             console.error(`Error stopping speaking: ${error}`);
//             setErrorMessage('Error stopping speech.');
//         });
//     }, []);

//     const handleUserQuery = useCallback((userQuery, userQueryHTML, imgUrlPath) => {
//         console.log('Handling user query:', userQuery);
//         lastInteractionTime.current = new Date();
//         let contentMessage = userQuery;
//         if (imgUrlPath.trim()) {
//             contentMessage = [
//                 { type: "text", text: userQuery },
//                 { type: "image_url", image_url: { url: imgUrlPath } },
//             ];
//         }
//         messages.current.push({ role: 'user', content: contentMessage });
//         setChatHistory((prev) => prev + (imgUrlPath.trim() ? `<br/><br/>User: ${userQueryHTML}` : `<br/><br/>User: ${userQuery}<br/>`));
//         const chatHistoryDiv = document.getElementById('chatHistory');
//         if (chatHistoryDiv) chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

//         if (isSpeaking) {
//             stopSpeaking();
//         }

//         if (dataSources.current.length > 0 && enableQuickReply) {
//             speak(getQuickReply(), 2000);
//         }

//         const url = dataSources.current.length > 0
//             ? `${openAIConfig.endpoint}/openai/deployments/${openAIConfig.deploymentName}/extensions/chat/completions?api-version=2023-06-01-preview`
//             : `${openAIConfig.endpoint}/openai/deployments/${openAIConfig.deploymentName}/chat/completions?api-version=2023-06-01-preview`;
//         const body = JSON.stringify({
//             dataSources: dataSources.current.length > 0 ? dataSources.current : undefined,
//             messages: messages.current,
//             stream: true,
//         });

//         let assistantReply = '';
//         let toolContent = '';
//         let spokenSentence = '';
//         let displaySentence = '';

//         fetch(url, {
//             method: 'POST',
//             headers: { 'api-key': openAIConfig.apiKey, 'Content-Type': 'application/json' },
//             body,
//         }).then((response) => {
//             if (!response.ok) {
//                 console.error(`Chat API response status: ${response.status} ${response.statusText}`);
//                 setErrorMessage(`Failed to connect to OpenAI API: ${response.status} ${response.statusText}`);
//                 return;
//             }
//             const reader = response.body.getReader();
//             const read = (previousChunkString = '') => {
//                 return reader.read().then(({ value, done }) => {
//                     if (done) {
//                         if (spokenSentence) {
//                             speak(spokenSentence);
//                             spokenSentence = '';
//                         }
//                         if (dataSources.current.length > 0 && toolContent) {
//                             messages.current.push({ role: 'tool', content: toolContent });
//                         }
//                         if (assistantReply) {
//                             messages.current.push({ role: 'assistant', content: assistantReply });
//                         }
//                         console.log('Stream completed. Final assistant reply:', assistantReply);
//                         return;
//                     }
//                     let chunkString = new TextDecoder().decode(value, { stream: true });
//                     if (previousChunkString) chunkString = previousChunkString + chunkString;
//                     if (!chunkString.endsWith('}\n\n') && !chunkString.endsWith('[DONE]\n\n')) return read(chunkString);

//                     chunkString.split('\n\n').forEach((line) => {
//                         if (line.startsWith('data:') && !line.endsWith('[DONE]')) {
//                             try {
//                                 const responseJson = JSON.parse(line.substring(5).trim());
//                                 let responseToken = dataSources.current.length === 0
//                                     ? responseJson.choices?.[0]?.delta?.content
//                                     : responseJson.choices?.[0]?.messages?.[0]?.delta?.content;
//                                 if (responseToken) {
//                                     if (byodDocRegex.test(responseToken)) {
//                                         responseToken = responseToken.replace(byodDocRegex, '').trim();
//                                     }
//                                     if (responseToken === '[DONE]') responseToken = undefined;
//                                 }
//                                 if (responseToken) {
//                                     assistantReply += responseToken;
//                                     displaySentence += responseToken;
//                                     spokenSentence += responseToken;
//                                     if (responseToken === '\n' || responseToken === '\n\n') {
//                                         speak(spokenSentence);
//                                         spokenSentence = '';
//                                     } else {
//                                         responseToken = responseToken.replace(/\n/g, '');
//                                         if (responseToken.length === 1 || responseToken.length === 2) {
//                                             for (const punctuation of sentenceLevelPunctuations) {
//                                                 if (responseToken.startsWith(punctuation)) {
//                                                     speak(spokenSentence);
//                                                     spokenSentence = '';
//                                                     break;
//                                                 }
//                                             }
//                                         }
//                                     }
//                                 }

//                                 if (!enableDisplayTextAlignmentWithSpeech) {
//                                     setChatHistory((prev) => prev + displaySentence.replace(/\n/g, '<br/>'));
//                                     const chatHistoryDiv = document.getElementById('chatHistory');
//                                     if (chatHistoryDiv) chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
//                                     displaySentence = '';
//                                 }
//                             } catch (error) {
//                                 console.error(`Error parsing response: ${error}, chunk: ${line}`);
//                                 setErrorMessage('Error processing API response.');
//                             }
//                         }
//                     });
//                     return read();
//                 });
//             };
//             setChatHistory((prev) => prev + (imgUrlPath.trim() ? 'Assistant: ' : '<br/>Assistant: '));
//             return read();
//         }).catch((error) => {
//             console.error(`Fetch error: ${error}`);
//             setErrorMessage('Failed to connect to OpenAI API.');
//         });
//     }, [openAIConfig, isSpeaking, stopSpeaking, speak, enableOyd]);

//     const getQuickReply = () => quickReplies[Math.floor(Math.random() * quickReplies.length)];

//     const checkHung = useCallback(() => {
//         const videoElement = document.getElementById('videoPlayer');
//         if (videoElement && sessionActive) {
//             const videoTime = videoElement.currentTime;
//             setTimeout(() => {
//                 if (videoElement.currentTime === videoTime && sessionActive && autoReconnectAvatar && (new Date() - lastInteractionTime.current < 300000)) {
//                     console.log('Video stream disconnected, reconnecting...');
//                     isReconnecting.current = true;
//                     disconnectAvatar();
//                     connectAvatar();
//                 }
//             }, 2000);
//         }
//     }, [sessionActive, autoReconnectAvatar, disconnectAvatar, connectAvatar]);

//     const checkLastSpeak = useCallback(() => {
//         if (lastSpeakTime.current && (new Date() - lastSpeakTime.current > 15000) && useLocalVideoForIdle && sessionActive && !isSpeaking) {
//             disconnectAvatar();
//             document.getElementById('localVideo').hidden = false;
//             document.getElementById('remoteVideo').style.width = '0.1px';
//             setSessionActive(false);
//         }
//     }, [useLocalVideoForIdle, sessionActive, isSpeaking, disconnectAvatar]);

//     const startSession = useCallback(() => {
//         console.log('Start session clicked');
//         lastInteractionTime.current = new Date();
//         if (useLocalVideoForIdle) {
//             document.getElementById('localVideo').hidden = false;
//             document.getElementById('remoteVideo').style.width = '0.1px';
//             setSessionActive(true);
//             return;
//         }
//         connectAvatar();
//     }, [useLocalVideoForIdle, connectAvatar]);

//     const stopSession = useCallback(() => {
//         console.log('Stop session clicked');
//         lastInteractionTime.current = new Date();
//         disconnectAvatar();
//         document.getElementById('localVideo').hidden = true;
//     }, [disconnectAvatar]);

//     const clearChatHistory = useCallback(() => {
//         console.log('Clear chat history clicked');
//         lastInteractionTime.current = new Date();
//         setChatHistory('');
//         initMessages();
//     }, [initMessages]);

//     const toggleMicrophone = useCallback(async () => {
//         console.log('Toggle microphone clicked');
//         lastInteractionTime.current = new Date();
//         if (microphoneText === 'Stop Microphone') {
//             speechRecognizer.current.stopContinuousRecognitionAsync(() => {
//                 setMicrophoneText('Start Microphone');
//                 console.log('Microphone stopped');
//             }, (err) => {
//                 console.error(`Failed to stop recognition: ${err}`);
//                 setErrorMessage('Failed to stop microphone.');
//             });
//             return;
//         }

//         try {
//             await navigator.mediaDevices.getUserMedia({ audio: true });
//             console.log('Microphone permission granted');

//             if (useLocalVideoForIdle && !sessionActive) {
//                 connectAvatar();
//                 setTimeout(() => {
//                     const audioPlayer = document.getElementById('audioPlayer');
//                     if (audioPlayer) audioPlayer.play().catch((e) => console.error(`Audio play error: ${e}`));
//                 }, 5000);
//             } else {
//                 const audioPlayer = document.getElementById('audioPlayer');
//                 if (audioPlayer) audioPlayer.play().catch((e) => console.error(`Audio play error: ${e}`));
//             }

//             speechRecognizer.current.recognized = async (s, e) => {
//                 if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
//                     const userQuery = e.result.text.trim();
//                     console.log('Speech recognized:', userQuery);
//                     if (userQuery) {
//                         if (!continuousConversation) {
//                             speechRecognizer.current.stopContinuousRecognitionAsync(() => {
//                                 setMicrophoneText('Start Microphone');
//                                 console.log('Microphone stopped after recognition');
//                             }, (err) => console.error(`Failed to stop recognition: ${err}`));
//                         }
//                         handleUserQuery(userQuery, '', '');
//                     }
//                 }
//             };

//             speechRecognizer.current.startContinuousRecognitionAsync(() => {
//                 setMicrophoneText('Stop Microphone');
//                 console.log('Microphone started');
//             }, (err) => {
//                 console.error(`Failed to start recognition: ${err}`);
//                 setErrorMessage('Failed to start microphone.');
//             });
//         } catch (err) {
//             console.error(`Microphone permission error: ${err}`);
//             setErrorMessage('Microphone access denied.');
//         }
//     }, [useLocalVideoForIdle, sessionActive, continuousConversation, connectAvatar, handleUserQuery, microphoneText]);

//     return {
//         sessionActive,
//         isSpeaking,
//         chatHistory,
//         errorMessage,
//         microphoneText,
//         startSession,
//         stopSession,
//         toggleMicrophone,
//         stopSpeaking,
//         clearChatHistory,
//         handleUserQuery
//     };
// };

// // ErrorMessage component
// const ErrorMessage = ({ errorMessage }) => {
//     if (!errorMessage) return null;
//     return (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {errorMessage}
//         </div>
//     );
// };

// // ControlButtons component
// const ControlButtons = ({
//     sessionActive,
//     isSpeaking,
//     useLocalVideoForIdle,
//     startSession,
//     toggleMicrophone,
//     stopSpeaking,
//     clearChatHistory,
//     stopSession,
//     microphoneText
// }) => (
//     <div className="mt-4 flex space-x-2 justify-center">
//         <button
//             onClick={startSession}
//             disabled={sessionActive && !useLocalVideoForIdle}
//             className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
//         >
//             Open Avatar Session
//         </button>
//         <button
//             id="microphone"
//             onClick={toggleMicrophone}
//             disabled={!sessionActive}
//             className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
//         >
//             {microphoneText}
//         </button>
//         <button
//             onClick={stopSpeaking}
//             disabled={!isSpeaking}
//             className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
//         >
//             Stop Speaking
//         </button>
//         <button
//             onClick={clearChatHistory}
//             className="bg-yellow-500 text-white px-4 py-2 rounded"
//         >
//             Clear Chat History
//         </button>
//         <button
//             onClick={stopSession}
//             disabled={!sessionActive}
//             className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
//         >
//             Close Avatar Session
//         </button>
//     </div>
// );

// // VideoContainer component
// const VideoContainer = ({ sessionActive, useLocalVideoForIdle, showSubtitles, chatHistory }) => (
//     <div id="videoContainer" className="relative w-[960px] h-[540px] mt-4 bg-gray-100 mx-auto" style={{ zIndex: 0 }}>
//         <div id="overlayArea" className="absolute" style={{ zIndex: 20 }}>
//             <div
//                 id="chatHistory"
//                 className="w-96 h-[480px] text-base border-none resize-none bg-transparent overflow-auto"
//                 contentEditable="true"
//                 dangerouslySetInnerHTML={{ __html: chatHistory }}
//                 hidden={!sessionActive}
//             ></div>
//         </div>
//         <div id="localVideo" className={`${useLocalVideoForIdle && !sessionActive ? '' : 'hidden'}`}>
//             <video
//                 src="/video/lisa-casual-sitting-idle.mp4"
//                 autoPlay
//                 loop
//                 muted
//                 style={{ width: '960px', height: '540px', zIndex: 5 }}
//             ></video>
//         </div>
//         <div id="remoteVideo" className="w-[960px] h-[540px]" style={{ zIndex: 10, backgroundColor: '#000' }}></div>
//         <div
//             id="subtitles"
//             className={`w-full text-center text-white text-2xl absolute bottom-5 z-50 ${showSubtitles ? '' : 'hidden'}`}
//             style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', zIndex: 30 }}
//         ></div>
//     </div>
// );

// // MessageBox component
// const MessageBox = ({
//     sessionActive,
//     showTypeMessage,
//     setShowTypeMessage,
//     setImgUrl,
//     handleUserQuery,
//     useLocalVideoForIdle
// }) => {
//     const handleKeyUp = (e) => {
//         if (e.key === 'Enter') {
//             const userMessageBox = document.getElementById('userMessageBox');
//             const userQuery = userMessageBox.innerText.trim();
//             const childImg = userMessageBox.querySelector("#picInput");
//             if (childImg) {
//                 childImg.style.width = "200px";
//                 childImg.style.height = "200px";
//             }
//             let userQueryHTML = userMessageBox.innerHTML.trim();
//             if (userQueryHTML.startsWith('<img')) {
//                 userQueryHTML = "<br/>" + userQueryHTML;
//             }
//             if (userQuery) {
//                 handleUserQuery(userQuery, userQueryHTML, imgUrl);
//                 userMessageBox.innerHTML = '';
//                 setImgUrl('');
//             }
//         }
//     };

//     const handleImageUpload = () => {
//         setImgUrl("https://wallpaperaccess.com/full/528436.jpg");
//         const userMessageBox = document.getElementById("userMessageBox");
//         const childImg = userMessageBox.querySelector("#picInput");
//         if (childImg) {
//             userMessageBox.removeChild(childImg);
//         }
//         userMessageBox.innerHTML += '<br/><img id="picInput" src="https://wallpaperaccess.com/full/528436.jpg" style="width:100px;height:100px"/><br/><br/>';
//     };

//     return (
//         <div className="mx-auto w-[960px]">
//             <div className={`${useLocalVideoForIdle ? 'hidden' : ''}`}>
//                 <input
//                     type="checkbox"
//                     checked={showTypeMessage}
//                     onChange={() => setShowTypeMessage(!showTypeMessage)}
//                     disabled={!sessionActive}
//                 /> Type Message
//             </div>
//             <div
//                 id="userMessageBox"
//                 className={`w-[940px] min-h-[150px] max-h-[200px] border overflow-y-scroll p-2 ${showTypeMessage ? '' : 'hidden'}`}
//                 contentEditable="true"
//                 onKeyUp={handleKeyUp}
//             ></div>
//             <div>
//                 <img
//                     id="uploadImgIcon"
//                     src="/image/attachment.jpg"
//                     alt="Upload"
//                     className={`cursor-pointer ${showTypeMessage ? '' : 'hidden'}`}
//                     onClick={handleImageUpload}
//                 />
//             </div>
//         </div>
//     );
// };

// // App component
// const App = () => {
//     const config = {
//         speech: {
//             region: 'southeastasia',
//             apiKey: '4yEIQp26V39RSfLeem530nZx7ev07IpyfadizBcIUao9OkHWhrSjJQQJ99BEACqBBLyXJ3w3AAAYACOGmUY3',
//             enablePrivateEndpoint: false,
//             privateEndpoint: ''
//         },
//         openAI: {
//             endpoint: 'https://athar-ma6hbszz-southindia.openai.azure.com',
//             apiKey: '3aAKd0F24mOsy1x8eJrqVVdVuTKKUwGX1ySDOJqCaSwhKLDmrTASJQQJ99BEAC77bzfXJ3w3AAAAACOG4Cq3',
//             deploymentName: 'gpt-4o',
//             prompt: 'You are an AI assistant that helps people find information.'
//         },
//         cogSearch: {
//             enableOyd: false,
//             endpoint: '',
//             apiKey: '',
//             indexName: ''
//         },
//         sttTts: {
//             sttLocales: 'en-US,de-DE,es-ES,fr-FR,it-IT,ja-JP,ko-KR,zh-CN',
//             ttsVoice: 'en-US-AvaMultilingualNeural',
//             customVoiceEndpointId: '',
//             personalVoiceSpeakerProfileID: '',
//             continuousConversation: false
//         },
//         avatar: {
//             character: 'lisa',
//             style: 'casual-sitting',
//             customized: false,
//             autoReconnect: false,
//             useLocalVideoForIdle: false,
//             showSubtitles: false
//         }
//     };
//     const [showTypeMessage, setShowTypeMessage] = useState(false);
//     const [imgUrl, setImgUrl] = useState('');

//     const {
//         sessionActive,
//         isSpeaking,
//         chatHistory,
//         errorMessage,
//         microphoneText,
//         startSession,
//         stopSession,
//         toggleMicrophone,
//         stopSpeaking,
//         clearChatHistory,
//         handleUserQuery
//     } = useAvatar({
//         speechConfig: config.speech,
//         openAIConfig: config.openAI,
//         cogSearchConfig: config.cogSearch,
//         sttTtsConfig: config.sttTts,
//         avatarConfig: config.avatar,
//         enableOyd: config.cogSearch.enableOyd,
//         continuousConversation: config.sttTts.continuousConversation,
//         showSubtitles: config.avatar.showSubtitles,
//         autoReconnectAvatar: config.avatar.autoReconnect,
//         useLocalVideoForIdle: config.avatar.useLocalVideoForIdle,
//         prompt: config.openAI.prompt
//     });

//     return (
//         <div className="container mx-auto p-4">
//             <h1 className="text-2xl font-bold mb-4 text-center">Talking Avatar Chat Demo</h1>
//             <ErrorMessage errorMessage={errorMessage} />
//             <ControlButtons
//                 sessionActive={sessionActive}
//                 isSpeaking={isSpeaking}
//                 useLocalVideoForIdle={config.avatar.useLocalVideoForIdle}
//                 startSession={startSession}
//                 toggleMicrophone={toggleMicrophone}
//                 stopSpeaking={stopSpeaking}
//                 clearChatHistory={clearChatHistory}
//                 stopSession={stopSession}
//                 microphoneText={microphoneText}
//             />
//             <VideoContainer
//                 sessionActive={sessionActive}
//                 useLocalVideoForIdle={config.avatar.useLocalVideoForIdle}
//                 showSubtitles={config.avatar.showSubtitles}
//                 chatHistory={chatHistory}
//             />
//             <MessageBox
//                 sessionActive={sessionActive}
//                 showTypeMessage={showTypeMessage}
//                 setShowTypeMessage={setShowTypeMessage}
//                 setImgUrl={setImgUrl}
//                 handleUserQuery={handleUserQuery}
//                 useLocalVideoForIdle={config.avatar.useLocalVideoForIdle}
//             />
//         </div>
//     );
// };

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/HomeComponents/Navbar";
import Home from "./pages/Home";

function App() {
  return (
    <div
      className=" bg-cover bg-center"
      style={{ backgroundImage: "url('/Background.jpg')" }}
    >
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

export default App;
