import React, { useState, useEffect } from "react";
import PersonCard from "../components/PersonCard";
import { api, tokenStorage } from "../utils/api";

interface Person {
  id: number;
  name: string;
  major?: string;
  year: number;
  imageUrl: string;
  commentCount: number;
}

const SubmitPage: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPeople = async () => {
      try {
        const data = await api.getPeople();
        setPeople(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load people"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPeople();
  }, []);

  const handleSubmitComment = (personId: number) => {
    return async (text: string) => {
      const { id, editToken } = await api.submitComment(personId, text);
      tokenStorage.saveEditToken(id, editToken);
      
      // Update comment count
      setPeople((prevPeople) =>
        prevPeople.map((person) =>
          person.id === personId
            ? { ...person, commentCount: person.commentCount + 1 }
            : person
        )
      );
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading people...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Comments Gallery
          </h1>
          <p className="text-xl text-gray-600">
            Click a card to share your thoughts about someone
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-800">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              name={person.name}
              major={person.major}
              year={person.year}
              imageUrl={person.imageUrl}
              commentCount={person.commentCount}
              onSubmitComment={handleSubmitComment(person.id)}
              isLoading={isLoading}
            />
          ))}
        </div>

        {people.length === 0 && (
          <div className="text-center text-gray-500">
            <p>No people found. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitPage;
