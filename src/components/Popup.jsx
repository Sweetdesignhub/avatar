function Popup({ popupState }) {
  if (!popupState) return null;

  const { type, message } = popupState;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto text-left shadow-lg flex gap-8 relative">
        {type === "loading" ? (
          <>
            <div>
              <p className="text-lg font-semibold text-gray-800 mb-4">
                {message.split("\n")[0]}
              </p>
              <p className="text-base text-gray-600 mb-4">
                {message.split("\n")[1]}
              </p>
              <p className="text-base font-bold text-gray-800">
                {message.split("\n")[2]}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div>
                <img src="/Surgeon.png" alt="Surgeon" />
              </div>
              <h2 className="font-johnsonDisplay font-semibold text-[#2E8669] whitespace-nowrap">
                Surgeon on speed dial
              </h2>
            </div>

            {/* Centered Loading Spinner */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </>
        ) : (
          <p className="text-lg font-semibold text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
}

export default Popup;