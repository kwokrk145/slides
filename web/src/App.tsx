import { useState } from "react";
import SubmitPage from "./pages/SubmitPage";
import GalleryPage from "./pages/GalleryPage";
import AdminPage from "./pages/AdminPage";

type Page = "submit" | "gallery" | "admin";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("submit");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Comments Gallery</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage("submit")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === "submit"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Add Comments
            </button>
            <button
              onClick={() => setCurrentPage("gallery")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === "gallery"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setCurrentPage("admin")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === "admin"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === "submit" && <SubmitPage />}
      {currentPage === "gallery" && <GalleryPage />}
      {currentPage === "admin" && <AdminPage />}
    </div>
  );
}

export default App;
