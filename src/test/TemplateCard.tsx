interface TemplateCardProps {
  svgString: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}

export default function TemplateCard({
  svgString,
  name,
  selected,
  onClick,
}: TemplateCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer overflow-hidden rounded-2xl aspect-3/4 flex items-center justify-center 
      border-2 transition-all duration-300 shadow-md 
      ${
        selected
          ? "border-yellow-500 shadow-xl scale-[1.05] bg-linear-to-br from-yellow-50 to-blue-50"
          : "border-gray-200 hover:border-yellow-400 bg-white hover:shadow-lg hover:scale-[1.02]"
      }`}
    >
      {/* SVG preview area */}
      <div
        onClick={onClick}
        className={`template-card relative cursor-pointer overflow-hidden rounded-2xl aspect-3/4 max-w-[180px] flex items-center justify-center 
    border-2 transition-all duration-300 shadow-md 
    ${
      selected
        ? "border-yellow-500 shadow-xl scale-[1.05] bg-linear-to-br from-yellow-50 to-blue-50"
        : "border-gray-200 hover:border-yellow-400 bg-white hover:shadow-lg hover:scale-[1.02]"
    }`}
      >
        <div
          className="w-full h-full flex items-center justify-center p-4 bg-white rounded-lg shadow-inner pointer-events-none"
          dangerouslySetInnerHTML={{ __html: svgString }}
        />
      </div>

      {/* Label */}
      <div
        className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full transition-all backdrop-blur-sm 
        ${
          selected ? "bg-yellow-500 text-white" : "bg-gray-800/80 text-gray-100"
        }`}
      >
        {name}
      </div>

      {/* Selected overlay checkmark */}
      {selected && (
        <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
          <div className="rounded-full bg-white p-2 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
