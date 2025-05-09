import { FaSearch, FaPlus, FaBook, FaAward, FaChartLine } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 font-johnsonText">
      <div className="max-w-full mx-auto px-4 py-3 flex items-center">
        {/* Logo */}
        <div className="flex items-center mr-4">
          {/* <span className="text-red-600 font-bold text-lg">J&J</span> */}
          <span className="text-lg font-medium">
            <span className="text-gray-800">Med</span>
            <span className="text-[#EB1700]">Spec</span>
            <span className="text-gray-800">Mate</span>
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 mr-4 min-w-[200px]">
          <FaSearch className="text-gray-500 mr-2 text-sm" />
          <input
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-800 outline-none w-full"
          />
        </div>

        {/* Buttons */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center border border-gray-300 text-gray-600 rounded-full px-3 py-1 text-sm mr-4 hover:bg-gray-100 transition"
        >
          <FaPlus className="mr-1" />
          New Training
        </button>

        <button className="flex items-center text-gray-800 font-medium text-sm mr-4 hover:text-gray-600 transition">
          <FaBook className="mr-1" />
          My Trainings
        </button>

        <button className="flex items-center text-gray-800 font-medium text-sm mr-4 hover:text-gray-600 transition">
          <FaAward className="mr-1" />
          AI Workspace
        </button>

        <button className="flex items-center text-gray-800 font-medium text-sm hover:text-gray-600 transition">
          <FaChartLine className="mr-1" />
          Insights
        </button>

        {/* Avatar */}
        <img
          alt="User"
          src="https://randomuser.me/api/portraits/men/32.jpg"
          className="w-9 h-9 rounded-full ml-4"
        />
      </div>
    </nav>
  );
}
