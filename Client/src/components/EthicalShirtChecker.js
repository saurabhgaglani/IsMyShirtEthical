import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function EthicalShirtChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate=useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();
      if (response.ok) {
        setData(result);
        navigate("/courses", { state: { analysisData: result } });

      } else {
        setError(result.Error || "An error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔹 Top Half: Expanded Background Section */}
      <div className="relative h-[70vh] flex flex-col items-center justify-center bg-black text-white">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/sweatshop-image.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Branding & Search Bar */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-extrabold tracking-wide">Is My Shirt Ethical?</h1>
          <p className="mt-2 text-xl text-gray-300">
            Keeping Fast-Fashion Accountable
          </p>

          <form onSubmit={handleSubmit} className="mt-8 w-full max-w-2xl">
            <div className="flex items-center bg-white text-gray-900 rounded-full shadow-lg overflow-hidden">
              <input
                type="url"
                className="flex-grow p-4 text-lg border-none focus:outline-none"
                placeholder="Enter a product URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-4 text-lg font-semibold rounded-r-full hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </form>

          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </div>

      {/* 🔹 Mission Statement */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-16 bg-gray-100 text-gray-900">
        <h2 className="text-3xl font-bold mb-4">Mission Statement</h2>
        <p className="max-w-2xl text-lg">
          Every purchase we make shapes the world. Fast fashion relies on{" "}
          <strong>exploitative labor, environmental destruction, and misleading sustainability claims.</strong>
           Our mission is to <strong>bring transparency</strong> to the clothing industry, helping you make informed,
          ethical decisions.
        </p>
      </div>

      {/* 🔹 Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-16 bg-white">
        {/* Card 1: Transparency */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-2xl font-semibold mb-3">Transparency</h3>
          <p className="text-gray-700">
            Brands often hide where and how clothes are made. We analyze their disclosures to reveal what they aren't
            telling you.
          </p>
        </div>

        {/* Card 2: Labor Conditions */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-2xl font-semibold mb-3">Labor Conditions</h3>
          <p className="text-gray-700">
            Many workers in fast fashion factories are underpaid and overworked. We check ethical standards and past
            controversies.
          </p>
        </div>

        {/* Card 3: Sustainability */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-2xl font-semibold mb-3">Sustainability</h3>
          <p className="text-gray-700">
            "Greenwashing" is everywhere. We investigate whether brands truly use sustainable practices or just market
            them.
          </p>
        </div>
      </div>
    </div>
  );
}
