import { Routes, Route, Navigate } from "react-router-dom";
import { AvatarProvider, useAvatarContext } from "./contexts/AvatarContext";
import Navbar from "./components/HomeComponents/Navbar";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Popup from "./components/Popup";

function AppContent() {
  const { popupState } = useAvatarContext();

  return (
    <div
      className="min-w-screen min-h-screen bg-cover bg-center overflow-y-auto overflow-x-hidden"
    >
      <Popup popupState={popupState} />
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AvatarProvider>
      <AppContent />
    </AvatarProvider>
  );
}

export default App;