import { useCallback, useRef, useEffect, useState } from "react";
import AllOptions from "./HomeComponents/AllOptions";

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
  isSpeaking,
  onStartingChange, // <-- new prop
  setTextareaRef, // This prop receives the callback function from parent
  forwardRefToGrandparent, // New prop to forward ref to grandparent
}) => {
  const textareaRef = useRef(null);
  const [starting, setStarting] = useState(true);
  const [startingAvatar, setStartingAvatar] = useState(true);

  const handleStart = () => {
    setStarting(true); // 1. Set starting to true
    setStartingAvatar(false);
    onStartingChange?.(false); // <-- Notify grandparent
    startSession(); // 3. Start the session
  };

  useEffect(() => {
    onStartingChange?.(starting);
  }, [starting]);

  // Pass the ref up to the parent AND grandparent components when it's available
  useEffect(() => {
    if (textareaRef.current) {
      // Pass to parent if needed
      if (setTextareaRef) {
        setTextareaRef(textareaRef);
      }

      // Pass to grandparent
      if (forwardRefToGrandparent) {
        forwardRefToGrandparent(textareaRef);
      }
    }
  }, [setTextareaRef, forwardRefToGrandparent]);

  console.log("Session Active: ", sessionActive);
  console.log("textareaRef Active: ", textareaRef);

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const userQuery = textareaRef.current.value.trim();
        if (userQuery) {
          const userQueryHTML = imgUrl
            ? `<br/><img src="${imgUrl}" style="width:200px;height:200px"/><br/>${userQuery}`
            : userQuery;
          handleUserQuery(userQuery, userQueryHTML, imgUrl);
          textareaRef.current.value = "";
          setImgUrl("");
        }
      }
    },
    [handleUserQuery, imgUrl, setImgUrl]
  );

  const handleImageUpload = useCallback(() => {
    const newImgUrl = "https://wallpaperaccess.com/full/528436.jpg";
    setImgUrl(newImgUrl);
  }, [setImgUrl]);

  const clearTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  }, []);
  // (sessionActive || useLocalVideoForIdle) &&
  return (
    <div className="flex flex-col items-center font-johnsonText">
      <div className="w-[1500px] mx-auto flex flex-col items-center px-4  min-h-[100px] max-h-[90vh] overflow-auto bg-transparent">
        {!startingAvatar && (
          <div className="flex justify-center items-center mb-4 space-x-4 max-w-4xl">
            <div
              className=" overflow-y-auto p-2 rounded-lg "
              style={{ scrollbarWidth: "thin" }}
            >
              <div
                id="assistantMessages"
                className="assistant-content"
                dangerouslySetInnerHTML={{ __html: assistantMessages }}
              ></div>
            </div>

            <div className=" flex items-end" style={{ zIndex: 10 }}>
              <div
                id="localVideo"
                className={`${
                  useLocalVideoForIdle && !sessionActive ? "" : "hidden"
                }`}
              >
                <video
                  src="/video/lisa-casual-sitting-idle.mp4"
                  autoPlay
                  loop
                  muted
                  style={{ zIndex: 5 }}
                ></video>
              </div>
              <div
                id="remoteVideo"
                className="w-[450px] h-[300px]"
                style={{ zIndex: 10, background: "transparent" }}
              ></div>
              <div
                id="subtitles"
                className={`w-full text-center text-white text-sm absolute bottom-2 z-50 ${
                  showSubtitles ? "" : "hidden"
                }`}
                style={{
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                  zIndex: 30,
                }}
              ></div>
            </div>
          </div>
        )}
        <div className="flex flex-col bg-white rounded-xl  border border-gray-200 shadow-md p-4 w-full max-w-4xl mx-auto">
          <textarea
            id="userMessageBox"
            ref={textareaRef}
            className="w-full min-h-[40px] max-h-[200px] overflow-auto resize-y rounded-xl pt-2 px-4 bg-white text-gray-700 placeholder-gray-400 focus:outline-none text-semibold"
            onKeyUp={handleKeyUp}
            placeholder="Type or speak your message here..."
            style={{ scrollbarWidth: "thin" }}
          ></textarea>
          <div className="flex justify-between items-center gap-4 mt-3">
            <div className="flex justify-around  ">
              <div className="relative group">
                <button
                  onClick={stopSession}
                  disabled={!sessionActive}
                  className={`disabled:opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95`}
                  title="Close Avatar Session"
                >
                  <svg
                    className={`${
                      sessionActive
                        ? "bg-[#EB1700] hover:bg-[#c91400] text-white"
                        : "bg-transparent text-gray-500"
                    } w-8 h-8 rounded-full border border-gray-200 transition-transform duration-200 group-hover:scale-110`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                  </svg>
                </button>

                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Close Avatar Session
                </div>
              </div>
              <div className="relative group">
                <button
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  className={`disabled:opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95`}
                  title="Stop Speaking"
                >
                  <svg
                    className={`${
                      isSpeaking
                        ? "text-[#EB1700] hover:text-[#c91400]"
                        : "text-gray-500"
                    } w-10 h-10 transition-transform duration-200 rounded-full group-hover:scale-110`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 6h12v12H6z" />
                  </svg>
                </button>

                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Stop Speaking
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={clearChatHistory}
                  disabled={!sessionActive} // Assuming you want to disable it similarly
                  className={`active:bg-gray-200 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95 disabled:opacity-50`}
                  title="Clear Chat History"
                >
                  <svg
                    className={`${
                      sessionActive
                        ? "text-[#EB1700] hover:text-[#c91400]"
                        : "text-gray-500"
                    } w-8 h-8 transition duration-150`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>

                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Clear Chat History
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={toggleMicrophone}
                  disabled={!sessionActive}
                  className={`disabled:opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95`}
                  title={microphoneText}
                >
                  <img
                    src="/mic-icon.svg"
                    alt="Mic Icon"
                    className={`${
                      sessionActive
                        ? "text-[#EB1700] hover:bg-[#c91400]"
                        : "bg-transparent hover:bg-gray-200 active:bg-gray-300"
                    } w-3/4 h-3/4 transition-transform rounded-full duration-200 group-hover:scale-110 `}
                  />
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {microphoneText}
                </div>
              </div>
            </div>
            <button
              onClick={handleStart}
              disabled={sessionActive && !useLocalVideoForIdle}
              className={`${
                sessionActive && !useLocalVideoForIdle
                  ? "bg-[#EB1700] hover:bg-[#c91400] text-white"
                  : "bg-transparent text-gray-500"
              }  disabled:opacity-50 rounded-full p-2 my-2 w-40 h-10 flex items-center justify-center border border-gray-200`}
              title="Open Avatar Session"
            >
              Start Training
            </button>
          </div>
        </div>
      </div>
      {startingAvatar && (
        <div className="max-w-4xl">
          <AllOptions />
        </div>
      )}
    </div>
  );
};

export default MessageBox;

// import { useCallback, useRef } from "react";
// import AllOptions from "./HomeComponents/AllOptions";

// const MessageBox = ({
//   sessionActive,
//   imgUrl,
//   setImgUrl,
//   handleUserQuery,
//   useLocalVideoForIdle,
//   showSubtitles,
//   chatHistory,
//   assistantMessages,
//   startSession,
//   toggleMicrophone,
//   stopSpeaking,
//   clearChatHistory,
//   stopSession,
//   microphoneText,
//   isSpeaking,
//   setTextareaRef, // Add this prop to receive the callback function
// }) => {
//   const textareaRef = useRef(null);

//   // Pass the ref up to the parent component when it's available
//   useEffect(() => {
//     if (textareaRef.current && setTextareaRef) {
//       setTextareaRef(textareaRef);
//     }
//   }, [setTextareaRef]);

//   console.log("Session Active: ", sessionActive);
//   console.log("textareaRef Active: ", textareaRef);

//   const handleKeyUp = useCallback(
//     (e) => {
//       if (e.key === "Enter" && !e.shiftKey) {
//         e.preventDefault();
//         const userQuery = textareaRef.current.value.trim();
//         if (userQuery) {
//           const userQueryHTML = imgUrl
//             ? `<br/><img src="${imgUrl}" style="width:200px;height:200px"/><br/>${userQuery}`
//             : userQuery;
//           handleUserQuery(userQuery, userQueryHTML, imgUrl);
//           textareaRef.current.value = "";
//           setImgUrl("");
//         }
//       }
//     },
//     [handleUserQuery, imgUrl, setImgUrl]
//   );

//   const handleImageUpload = useCallback(() => {
//     const newImgUrl = "https://wallpaperaccess.com/full/528436.jpg";
//     setImgUrl(newImgUrl);
//   }, [setImgUrl]);

//   const clearTextarea = useCallback(() => {
//     if (textareaRef.current) {
//       textareaRef.current.value = "";
//     }
//   }, []);

//   return (
//     <div>
//       <div className="w-[1500px] mx-auto flex flex-col p-4 bg-transparent">
//         <div className="flex justify-end mb-4 space-x-4">
//           <div
//             className=" h-[400px] overflow-y-auto p-2 rounded-lg "
//             style={{ scrollbarWidth: "thin" }}
//           >
//             <div
//               id="assistantMessages"
//               className="assistant-content"
//               dangerouslySetInnerHTML={{ __html: assistantMessages }}
//             ></div>
//           </div>

//           <div className=" flex items-end" style={{ zIndex: 10 }}>
//             <div
//               id="localVideo"
//               className={`${
//                 useLocalVideoForIdle && !sessionActive ? "" : "hidden"
//               }`}
//             >
//               <video
//                 src="/video/lisa-casual-sitting-idle.mp4"
//                 autoPlay
//                 loop
//                 muted
//                 style={{ zIndex: 5 }}
//               ></video>
//             </div>
//             <div
//               id="remoteVideo"
//               className="w-[320px] h-[180px]"
//               style={{ zIndex: 10, background: "transparent" }}
//             ></div>
//             <div
//               id="subtitles"
//               className={`w-full text-center text-white text-sm absolute bottom-2 z-50 ${
//                 showSubtitles ? "" : "hidden"
//               }`}
//               style={{
//                 textShadow:
//                   "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
//                 zIndex: 30,
//               }}
//             ></div>
//           </div>
//         </div>
//         {/* <div
//         id="chatHistory"
//         className="w-full max-h-[200px] overflow-y-auto p-2 mb-4 bg-white rounded-lg "
//         dangerouslySetInnerHTML={{ __html: chatHistory }}
//         style={{ scrollbarWidth: 'thin' }}
//       ></div> */}
//         <div className="flex flex-col bg-white rounded-xl  border border-gray-200 shadow-md p-4 w-full max-w-4xl mx-auto">
//           <textarea
//             id="userMessageBox"
//             ref={textareaRef}
//             className="w-full h-[60px] rounded-xl pt-2 px-4 resize-none bg-white text-gray-700 placeholder-gray-400 focus:outline-none text-semibold"
//             onKeyUp={handleKeyUp}
//             placeholder="Type or speak your message here..."
//             style={{ scrollbarWidth: "thin" }}
//           ></textarea>
//           <div className="flex justify-end items-center gap-4 mt-3">
//             {/* <img
//             id="uploadImgIcon"
//             src="/image/attachment.jpg"
//             alt="Upload"
//             className="cursor-pointer w-8 h-8 text-gray-500 hover:text-gray-700"
//             onClick={handleImageUpload}
//           /> */}
//             <div className="flex space-x-3">
//               <div className="relative group">
//                 <button
//                   onClick={toggleMicrophone}
//                   disabled={!sessionActive}
//                   className="text-gray-500 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95"
//                   title={microphoneText}
//                 >
//                   <img
//                     src="/mic-icon.svg"
//                     alt="Mic Icon"
//                     className="w-3/4 h-3/4 transition-transform duration-200 group-hover:scale-110"
//                   />
//                 </button>
//                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
//                   {microphoneText}
//                 </div>
//               </div>
//               <div className="relative group">
//                 <button
//                   onClick={stopSpeaking}
//                   disabled={!isSpeaking}
//                   className="text-gray-500  hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 rounded-full w-14 h-14 flex items-center justify-center  transition duration-150 cursor-pointer active:scale-95"
//                   title="Stop Speaking"
//                 >
//                   <svg
//                     className="w-10 h-10 transition-transform duration-200 border border-gray-200 rounded-full group-hover:scale-110"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path d="M6 6h12v12H6z" />
//                   </svg>
//                 </button>

//                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
//                   Stop Speaking
//                 </div>
//               </div>

//               <div className="relative group">
//                 <button
//                   onClick={clearChatHistory}
//                   className="text-gray-400 hover:bg-gray-100 active:bg-gray-200 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95"
//                   title="Clear Chat History"
//                 >
//                   <svg
//                     className="w-8 h-8 transition-transform duration-200 rounded-full  group-hover:scale-110 "
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
//                   </svg>
//                 </button>

//                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
//                   Clear Chat History
//                 </div>
//               </div>

//               <div className="relative group">
//                 <button
//                   onClick={stopSession}
//                   disabled={!sessionActive}
//                   className="text-gray-500 hover:bg-gray-100 active:bg-gray-300 disabled:opacity-50 rounded-full w-14 h-14 flex items-center justify-center transition duration-150 cursor-pointer active:scale-95"
//                   title="Close Avatar Session"
//                 >
//                   <svg
//                     className="w-8 h-8 rounded-full border border-gray-200 transition-transform duration-200 group-hover:scale-110"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
//                   </svg>
//                 </button>

//                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-gray-800 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
//                   Close Avatar Session
//                 </div>
//               </div>

//               <button
//                 onClick={startSession}
//                 disabled={sessionActive && !useLocalVideoForIdle}
//                 className="text-[#1D1D1D8C] hover:bg-gray-100 disabled:opacity-50 rounded-full p-2 my-2 w-40 h-10 flex items-center justify-center border border-gray-200"
//                 title="Open Avatar Session"
//               >
//                 Start Training

//               </button>
//             </div>
//           </div>
//           {/* {imgUrl && (
//           <div className="mt-3">
//             <img
//               src={imgUrl || "/placeholder.svg"}
//               alt="Uploaded"
//               className="w-24 h-24 object-cover rounded-lg"
//             />
//           </div>
//         )} */}
//         </div>

//         {/* {imgUrl && (
//           <div className="mt-2">
//             <img src={imgUrl} alt="Uploaded" style={{ width: '100px', height: '100px' }} />
//           </div>
//         )} */}
//       </div>
//       <div>
//         <AllOptions />
//       </div>
//     </div>
//   );
// };

// export default MessageBox;
