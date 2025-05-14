export default function OptionButton({
  icon,
  title,
  description,
  color,
  onClick,
}) {
  // console.log("Color: ", color);
  return (
    <div
      onClick={onClick}
      className="relative p-4 rounded-xl cursor-pointer transition-all hover:shadow-md hover:scale-105 h-32 w-36 bg-white shadow-sm"
    >
      {/* Top-right icon */}
      <div className={`absolute top-4 right-4 text-${color}-500 text-sm`}>
        {icon}
      </div>

      {/* Bottom-left text */}
      <div className="absolute font-merriweather bottom-4 left-4 text-left">
        <h3 className=" font-semibold text-gray-800 text-sm">
          {title}
        </h3>
        {/* <p className="text-gray-600 font-semibold text-xs">
          {description}
        </p> */}
      </div>
    </div>
  );
}
