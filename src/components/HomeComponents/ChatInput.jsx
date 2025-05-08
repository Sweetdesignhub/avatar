import { useState } from "react";
import AllOptions from "./AllOptions";
import { useNavigate } from "react-router-dom";

export default function ChatInput() {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      console.log("Submitted:", inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isInputEmpty = inputValue.trim() === "";

  // Callback from AllOptions
  const handleOptionSelect = (optionTitle) => {
    setInputValue(optionTitle); // insert selected option into input
  };

  return (
    <div className="flex flex-col items-center">
      <div className="px-6 py-4 w-full bg-white shadow-md rounded-lg">
        <div className="flex items-end gap-2 font-merriweather">
          <textarea
            placeholder="Is there any specific device or training you had in mind today, Priya?"
            className="text-sm text-gray-800 flex-1 font-merriweather w-full resize-none max-h-24 outline-none"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            rows={1}
          />
        </div>

        <div className="flex justify-end mt-3 gap-3">
          <div className="flex items-center gap-1">
            <button className="p-1">
              <img src="/mic-icon.svg" alt="Mic Icon" className="w-8 h-8" />
            </button>
            <button onClick={handleSubmit} className="p-1">
              <img src="/send-icon.svg" alt="Send Icon" className="w-8 h-8" />
            </button>
          </div>

          <button
            disabled={isInputEmpty}
            className={`px-4 py-1 rounded-xl shadow-sm font-merriweather normal-case transition-colors duration-200 ${
              isInputEmpty
                ? "bg-gray-100 text-[#1D1D1D8C] cursor-not-allowed"
                : "bg-[#EB1700] text-white hover:bg-red-700"
            }`}
            onClick={() => {
              navigate("/train");
            }}
          >
            Start Training
          </button>
        </div>
      </div>

      <div className="mt-4 w-full">
        <AllOptions onOptionSelect={handleOptionSelect} />
      </div>
    </div>
  );
}