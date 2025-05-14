import { useNavigate } from "react-router-dom";
import { useAvatarContext } from "../contexts/AvatarContext";
import AllOptions from "../components/HomeComponents/AllOptions";

function Home() {
  const navigate = useNavigate();
  const { startSession, showLoadingPopup } = useAvatarContext();

  const handleStartTraining = () => {
    showLoadingPopup();
    startSession();
    console.log("Navigating to /chat without initialQuery");
    localStorage.removeItem("initialQuery"); // Clear any stored query
    navigate("/chat");
  };

  const handleOptionSelect = (description) => {
    showLoadingPopup();
    startSession(description);
    console.log("Navigating to /chat with initialQuery:", description);
    localStorage.setItem("initialQuery", description); // Fallback storage
    navigate("/chat", { state: { initialQuery: description } });
  };

  return (
    <div 
      className="min-h-[90vh] flex flex-col justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: "url('/Background.jpg')" }}
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col justify-center items-center">
        <div className="flex flex-col items-center px-8">
          <h1 className="font-johnsonDisplay font-bold text-7xl leading-[110px] tracking-[0.15px] text-center align-middle">
            Revolutionizing
          </h1>
          <div className="flex flex-row">
            <h1 className="font-johnsonDisplay font-bold text-7xl text-red-600 leading-[110px] tracking-[0.15px] align-middle">
              Heart Surgery{" "}
            </h1>
            <h1 className="px-6 font-johnsonDisplay font-bold text-7xl leading-[110px] tracking-[0.15px] align-middle">
              with AI
            </h1>
          </div>
        </div>
      </div>
      <button
        onClick={handleStartTraining}
        className="mt-10 bg-[#EB1700] font-johnsonText font-semibold text-xl text-[#FFFFFF] rounded-full py-3 px-72 flex items-center justify-center"
      >
        Start Your Training
      </button>
      <AllOptions onOptionSelect={handleOptionSelect} />
    </div>
  );
}

export default Home;