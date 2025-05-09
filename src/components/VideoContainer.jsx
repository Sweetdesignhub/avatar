const VideoContainer = ({
  sessionActive,
  useLocalVideoForIdle,
  showSubtitles,
  chatHistory,
}) => (
  <div
    id="videoContainer"
    className="relative w-[960px] h-[1280px] mt-4 bg-gray-100 mx-auto"
    style={{ zIndex: 0 }}
  >
    <div id="overlayArea" className="absolute" style={{ zIndex: 20 }}>
      <div
        id="chatHistory"
        className="w-96 h-[480px] text-base border-none resize-none bg-transparent overflow-auto"
        contentEditable="true"
        dangerouslySetInnerHTML={{ __html: chatHistory }}
        hidden={!sessionActive}
      ></div>
    </div>
    <div
      id="localVideo"
      className={`${useLocalVideoForIdle && !sessionActive ? "" : "hidden"}`}
    >
      <video
        src="/video/lisa-casual-sitting-idle.mp4"
        autoPlay
        loop
        muted
        style={{ width: "960px", height: "680px", zIndex: 5 }}
      ></video>
    </div>
    <div
      id="remoteVideo"
      className="w-[450px] h-[300px]"
      style={{ zIndex: 10, backgroundColor: "#000" }}
    ></div>
    <div
      id="subtitles"
      className={`w-full text-center text-white text-2xl absolute bottom-5 z-50 ${
        showSubtitles ? "" : "hidden"
      }`}
      style={{
        textShadow:
          "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
        zIndex: 30,
      }}
    ></div>
  </div>
);

export default VideoContainer;
