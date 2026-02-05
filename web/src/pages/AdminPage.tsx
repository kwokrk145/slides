import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

type AdminTab = "gallery" | "people";

interface Person {
  id: number;
  name: string;
  major: string;
  year: number;
  imageUrl: string;
  commentCount: number;
}

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [currentTab, setCurrentTab] = useState<AdminTab>("gallery");
  const [isReleased, setIsReleased] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state for adding people
  const [newPerson, setNewPerson] = useState({
    name: "",
    major: "",
    year: new Date().getFullYear(),
    imageUrl: "",
  });

  // Check if already logged in (look for saved token in session)
  useEffect(() => {
    const savedToken = sessionStorage.getItem("adminToken");
    if (savedToken) {
      setIsLoggedIn(true);
      loadGalleryState();
      loadPeople();
    }
  }, []);

  const loadGalleryState = async () => {
    try {
      const state = await api.getGalleryState();
      setIsReleased(state.isReleased);
    } catch (err) {
      console.error("Failed to load gallery state:", err);
    }
  };

  const loadPeople = async () => {
    try {
      const token = sessionStorage.getItem("adminToken");
      if (!token) return;
      
      const data = await api.getAdminPeople(token);
      setPeople(data);
    } catch (err) {
      console.error("Failed to load people:", err);
    }
  };

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Get current state first
      const currentState = await api.getGalleryState();
      
      // Validate password by calling protected endpoint (send same state to avoid side effects)
      await api.updateGalleryState(currentState.isReleased, password);
      
      // If we got here, password is valid
      setIsLoggedIn(true);
      sessionStorage.setItem("adminToken", password);
      setIsReleased(currentState.isReleased);
      setPassword("");
    } catch {
      setError("Invalid admin password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleGallery = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem("adminToken");
      if (!token) {
        setError("Admin token not found");
        return;
      }

      const result = await api.updateGalleryState(!isReleased, token);
      setIsReleased(result.isReleased);
      setSuccess(result.message);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update gallery state"
      );
      // If unauthorized, require re-login
      if (
        err instanceof Error &&
        err.message.includes("Unauthorized")
      ) {
        setIsLoggedIn(false);
        sessionStorage.removeItem("adminToken");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerson = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem("adminToken");
      if (!token) {
        setError("Admin token not found");
        return;
      }

      await api.addPerson(newPerson, token);
      setSuccess("Person added successfully!");
      setNewPerson({ name: "", major: "", year: new Date().getFullYear(), imageUrl: "" });
      await loadPeople();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add person");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePerson = async (personId: number, personName: string) => {
    if (!confirm(`Delete ${personName}? This will also remove all their comments.`)) {
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem("adminToken");
      if (!token) {
        setError("Admin token not found");
        return;
      }

      const result = await api.removePerson(personId, token);
      setSuccess(result.message);
      await loadPeople();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove person");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("adminToken");
    setPassword("");
    setError("");
    setSuccess("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin</h1>
          <p className="text-gray-600 mb-6">Manage gallery release state</p>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-800 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage gallery and people
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setCurrentTab("gallery")}
              className={`px-4 py-2 font-medium transition-colors ${
                currentTab === "gallery"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Gallery State
            </button>
            <button
              onClick={() => setCurrentTab("people")}
              className={`px-4 py-2 font-medium transition-colors ${
                currentTab === "people"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Manage People
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-800">
              <p className="font-semibold">Error:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-green-800">
              <p className="font-semibold">✓ {success}</p>
            </div>
          )}

          {/* Gallery Tab */}
          {currentTab === "gallery" && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Gallery Release State
              </h2>

              <div className="flex items-center justify-between mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Current Status</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isReleased ? (
                      <span className="text-green-600 font-medium">
                        ✓ Gallery is RELEASED
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        Gallery is HIDDEN
                      </span>
                    )}
                  </p>
                </div>
                <div
                  className={`w-16 h-8 rounded-full transition-colors ${
                    isReleased ? "bg-green-500" : "bg-gray-300"
                  } flex items-center justify-end px-1`}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow" />
                </div>
              </div>

              <button
                onClick={handleToggleGallery}
                disabled={isLoading}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 ${
                  isReleased
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </div>
                ) : isReleased ? (
                  "Hide Gallery"
                ) : (
                  "Release Gallery"
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4">
                When released, users can see all submitted comments in the gallery.
              </p>
            </div>
          )}

          {/* Manage People Tab */}
          {currentTab === "people" && (
            <div>
              {/* Add Person Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Add New Person
                </h2>
                
                <form onSubmit={handleAddPerson} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newPerson.name}
                      onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Major
                    </label>
                    <input
                      type="text"
                      value={newPerson.major}
                      onChange={(e) => setNewPerson({ ...newPerson, major: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={newPerson.year}
                      onChange={(e) => setNewPerson({ ...newPerson, year: parseInt(e.target.value) })}
                      required
                      min="1900"
                      max="2100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photo URL
                    </label>
                    <input
                      type="url"
                      value={newPerson.imageUrl}
                      onChange={(e) => setNewPerson({ ...newPerson, imageUrl: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://images.unsplash.com/..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use an image URL (e.g., from Unsplash)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {isLoading ? "Adding..." : "Add Person"}
                  </button>
                </form>
              </div>

              {/* People List */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Current People ({people.length})
                </h2>

                <div className="space-y-2">
                  {people.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={person.imageUrl}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{person.name}</p>
                          <p className="text-sm text-gray-600">
                            {person.major} • Class of {person.year}
                          </p>
                          <p className="text-xs text-gray-500">
                            {person.commentCount} comments
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePerson(person.id, person.name)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {people.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No people added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
