import { useLocation } from "react-router-dom";

export default function DisplayPage() {
  const location = useLocation();
  const analysisData = location.state?.analysisData || {}; // ✅ Default to empty object
  const rating = analysisData["Overall Ethical Rating"] || 0; // ✅ Get the score
  const brand = analysisData["Brand"] || "This brand"; // ✅ Brand Name
  const animalMaterials = analysisData["Animal Materials"] || 0; // ✅ 0 = No animal materials, 1 = Uses animal materials
  const relatedLinks = analysisData["Related Links"] || []; // ✅ Array of links

  // ✅ Define colors & emojis based on rating
  const getRatingColor = (score) => {
    if (score >= 7) return "text-green-500";  // Good Ethics 👍
    if (score >= 4) return "text-yellow-500"; // Average Ethics 😐
    return "text-red-500";                    // Poor Ethics 👎
  };

  const getStrokeColor = (score) => {
    if (score >= 7) return "#22c55e"; // Green
    if (score >= 4) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  const getEmoji = (score) => {
    if (score >= 7) return "😃";  // Ethical
    if (score >= 4) return "😐";  // Neutral
    return "😞";                  // Unethical
  };

  // ✅ Score Explanation
  const getScoreDescription = (score) => {
    if (score >= 8) return `${brand} is highly transparent and ethical.`;
    if (score >= 6) return `${brand} does a moderately good job at ethical transparency.`;
    if (score >= 4) return `${brand} has some transparency but needs improvement.`;
    return `${brand} lacks ethical transparency and may have questionable practices.`;
  };

  return (
    <div className="mt-6 w-full max-w-4xl mx-auto bg-white text-gray-900 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Ethical Rating</h2>
      
      {/* ✅ Circular Score System & Description */}
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="10" fill="none" />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={getStrokeColor(rating)}
              strokeWidth="10"
              fill="none"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (rating / 10) * 251.2}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          {/* Smiley/Frown Face */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
            {getEmoji(rating)}
          </div>
        </div>
        {/* Score Label & Explanation */}
        <p className={`mt-4 text-xl font-bold ${getRatingColor(rating)}`}>
          Score: {rating}/10 - {getScoreDescription(rating)}
        </p>
      </div>

      {/* 🔹 Six Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Card 1: Material Composition */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Material Composition</h3>
          <p className="mt-2 text-gray-700">{analysisData["Material Composition"] || "Unknown"}</p>
        </div>

        {/* Card 2: Manufacturing Country */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Manufacturing Country</h3>
          <p className="mt-2 text-gray-700">{analysisData["Manufacturing Country"] || "Not Disclosed"}</p>
        </div>

        {/* Card 3: Sustainability Practices */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Sustainability Practices</h3>
          <p className="mt-2 text-gray-700">{analysisData["Sustainability Practices"] || "Unknown"}</p>
        </div>

        {/* Card 4: Labor Conditions */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Labor Conditions</h3>
          <p className="mt-2 text-gray-700">{analysisData["Labor Conditions"] || "No Data Available"}</p>
        </div>

        {/* Card 5: Transparency Level */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Transparency Level</h3>
          <p className="mt-2 text-gray-700">{analysisData["Transparency Level"] || "Not Specified"}</p>
        </div>

        {/* Card 6: Animal Materials */}
        <div className={`p-6 rounded-lg shadow-md ${animalMaterials === 0 ? "bg-green-100" : "bg-red-100"}`}>
          <h3 className="text-lg font-semibold text-gray-900">Animal Materials</h3>
          <p className={`mt-2 text-lg font-bold ${animalMaterials === 0 ? "text-green-600" : "text-red-600"}`}>
            {animalMaterials === 0 ? "No animal-based materials used 🟢" : "This product uses animal-based materials 🔴"}
          </p>
        </div>
      </div>

        {/* 🔹 Related Links Section */}
        {relatedLinks && (
          <div className="mt-10">
            <h3 className="text-2xl font-semibold mb-4">Related Articles & Sources</h3>
            <ul className="list-disc pl-5 space-y-2 text-blue-600">
              {relatedLinks
                .split(/\s+|,/) // ✅ Split by spaces or commas
                .filter(link => link.trim() !== "") // ✅ Remove empty values
                .map((link, index) => (
                  <li key={index}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                      {link}
                    </a>
                  </li>
              ))}
            </ul>
          </div>
        )}

    </div>
  );
}
