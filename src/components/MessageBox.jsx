import { useCallback, useRef } from 'react';

const MessageBox = ({
  sessionActive,
  imgUrl,
  setImgUrl,
  handleUserQuery,
  useLocalVideoForIdle,
  showSubtitles,
  chatHistory,
  assistantMessages,
  startSession,
  toggleMicrophone,
  stopSpeaking,
  clearChatHistory,
  stopSession,
  microphoneText,
  isSpeaking
}) => {
  const textareaRef = useRef(null);

  const handleKeyUp = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const userQuery = textareaRef.current.value.trim();
      if (userQuery) {
        const userQueryHTML = imgUrl ? `<br/><img src="${imgUrl}" style="width:200px;height:200px"/><br/>${userQuery}` : userQuery;
        handleUserQuery(userQuery, userQueryHTML, imgUrl);
        textareaRef.current.value = '';
        setImgUrl('');
      }
    }
  }, [handleUserQuery, imgUrl, setImgUrl]);

  const handleImageUpload = useCallback(() => {
    const newImgUrl = "https://wallpaperaccess.com/full/528436.jpg";
    setImgUrl(newImgUrl);
  }, [setImgUrl]);

  const clearTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-[1000px] mx-auto flex flex-col p-4 bg-transparent">
      <div className="flex justify-end mb-4 space-x-4">
        <div className=" h-[400px] overflow-y-auto p-2 rounded-lg" style={{ scrollbarWidth: 'thin' }}>
          <div id="assistantMessages" dangerouslySetInnerHTML={{ __html: assistantMessages }}></div>
        </div>
        <div className=" flex items-end" style={{ zIndex: 10 }}>
          <div id="localVideo" className={`${useLocalVideoForIdle && !sessionActive ? '' : 'hidden'}`}>
            <video
              src="/video/lisa-casual-sitting-idle.mp4"
              autoPlay
              loop
              muted
              style={{  zIndex: 5 }}
            ></video>
          </div>
          <div id="remoteVideo" className="w-[320px] h-[180px]" style={{ zIndex: 10, background: 'transparent' }}></div>
          <div
            id="subtitles"
            className={`w-full text-center text-white text-sm absolute bottom-2 z-50 ${showSubtitles ? '' : 'hidden'}`}
            style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', zIndex: 30 }}
          ></div>
        </div>
      </div>
      {/* <div
        id="chatHistory"
        className="w-full max-h-[200px] overflow-y-auto p-2 mb-4 bg-white rounded-lg "
        dangerouslySetInnerHTML={{ __html: chatHistory }}
        style={{ scrollbarWidth: 'thin' }}
      ></div> */}
      <div className="flex flex-col">
        <textarea
          id="userMessageBox"
          ref={textareaRef}
          className="w-full h-[100px] border  rounded-lg p-2 resize-none bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
          onKeyUp={handleKeyUp}
          placeholder="Type or speak your message here..."
          style={{ scrollbarWidth: 'thin' }}
        ></textarea>
        <div className="flex justify-between items-center mt-2">
          <img
            id="uploadImgIcon"
            src="/image/attachment.jpg"
            alt="Upload"
            className="cursor-pointer w-6 h-6 bg-red-500 rounded-full p-1"
            onClick={handleImageUpload}
          />
          <div className="flex space-x-2">
            <button
              onClick={startSession}
              disabled={sessionActive && !useLocalVideoForIdle}
              className="text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-full p-1"
              title="Open Avatar Session"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </button>
            <button
              onClick={toggleMicrophone}
              disabled={!sessionActive}
              className="text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-full p-1"
              title={microphoneText}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {microphoneText === 'Start Microphone' ? (
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                ) : (
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2zm-2.59 1.41L15.59 15 12 11.41 8.41 15 9.59 13.59 6 10l1.41-1.41L11 12.59 14.59 9 16 10.41 12.41 14z" />
                )}
              </svg>
            </button>
            <button
              onClick={stopSpeaking}
              disabled={!isSpeaking}
              className="text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-full p-1"
              title="Stop Speaking"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>
            <button
              onClick={clearChatHistory}
              className="text-white bg-red-500 hover:bg-red-600 rounded-full p-1"
              title="Clear Chat History"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </button>
            <button
              onClick={stopSession}
              disabled={!sessionActive}
              className="text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-full p-1"
              title="Close Avatar Session"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
              </svg>
            </button>
          </div>
        </div>
        {imgUrl && (
          <div className="mt-2">
            <img src={imgUrl} alt="Uploaded" style={{ width: '100px', height: '100px' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBox;