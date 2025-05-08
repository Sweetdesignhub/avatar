const ControlButtons = ({
    sessionActive,
    isSpeaking,
    useLocalVideoForIdle,
    startSession,
    toggleMicrophone,
    stopSpeaking,
    clearChatHistory,
    stopSession,
    microphoneText
  }) => (
    <div className="mt-4 flex space-x-2 justify-center">
      <button
        onClick={startSession}
        disabled={sessionActive && !useLocalVideoForIdle}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Open Avatar Session
      </button>
      <button
        id="microphone"
        onClick={toggleMicrophone}
        disabled={!sessionActive}
        className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {microphoneText}
      </button>
      <button
        onClick={stopSpeaking}
        disabled={!isSpeaking}
        className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Stop Speaking
      </button>
      <button
        onClick={clearChatHistory}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        Clear Chat History
      </button>
      <button
        onClick={stopSession}
        disabled={!sessionActive}
        className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Close Avatar Session
      </button>
    </div>
  );
  
  export default ControlButtons;