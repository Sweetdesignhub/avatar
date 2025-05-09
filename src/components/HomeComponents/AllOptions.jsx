import { useState } from "react";
import OptionButton from "./OptionButton";
import {
  FaHeart,
  FaRegHeart,
  FaHeartbeat,
  FaMedkit,
  FaHospital,
} from "react-icons/fa";

export default function AllOptions({ onOptionSelect }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (label) => {
    setSelectedOption(label);
    console.log("Selected option:", label);
    if (onOptionSelect) {
      onOptionSelect(label);
    }
  };

  const deviceOptions = [
    {
      id: "cardiac-stent",
      icon: <FaHeart className="text-3xl" />,
      title: "Usage of Cardiac Stent in Surgery",
      description: "How to use Cardiac Stent in a Heart Surgery?",
      color: "red",
    },
    {
      id: "angioplasty",
      icon: <FaRegHeart className="text-3xl" />,
      title: "Angioplasty Balloon Catheter Usage",
      description: "What is the use of Catheter in a Angioplasty Surgery?",
      color: "pink",
    },
    {
      id: "pacemaker",
      icon: <FaHeartbeat className="text-3xl" />,
      title: "Pacemaker Tool Training Guide",
      description: "Importance of Implantation Tool in Pacemaker?",
      color: "gray",
    },
    {
      id: "endoscopic",
      icon: <FaMedkit className="text-3xl" />,
      title: "Endoscopic Vessel Guide",
      description: "Why is Harvesting tool used in Endoscopic Vessal?",
      color: "blue",
    },
    {
      id: "aortic",
      icon: <FaHospital className="text-3xl" />,
      title: "Aneurysm Repair Device Guide",
      description: "What is the use of Repair Device in a Aortic Aneurysm?",
      color: "pink",
    },
  ];

  return (
    <div className="p-8 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        {deviceOptions.map((option) => (
          <div key={option.id}>
            <OptionButton
              icon={option.icon}
              title={option.title}
              description={option.description}
              color={option.color}
              onClick={() => handleOptionClick(option.description)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
