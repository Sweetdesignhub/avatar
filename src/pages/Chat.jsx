import AvatarChat from "../components/AvatarChat";

function Chat() {
  return (
    <div
      className="min-h-[90vh] overflow-y-auto overflow-x-hidden"
    //   style={{
    //     backgroundImage: "url('/Backgorund_WithoutIcon.jpg')",
    //     backgroundSize: "cover",
    //     backgroundPosition: "center",
    //   }}
    >
      <div className="mt-8 w-full flex items-center justify-center rounded-3xl">
        <AvatarChat />
      </div>
    </div>
  );
}

export default Chat;