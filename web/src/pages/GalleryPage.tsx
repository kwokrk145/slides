import React, { useState, useEffect } from "react";
import { api, tokenStorage } from "../utils/api";

interface Comment {
  id: number;
  text: string;
  createdAt: string;
}

interface Person {
  id: number;
  name: string;
  major?: string;
  year: number;
  imageUrl: string;
}

const GalleryPage: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isReleased, setIsReleased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [peopleData, stateData] = await Promise.all([
          api.getPeople(),
          api.getGalleryState(),
        ]);
        setPeople(peopleData);
        setIsReleased(stateData.isReleased);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load comments when current person changes
  useEffect(() => {
    if (people.length === 0) return;

    const currentPerson = people[currentIndex];
    const loadComments = async () => {
      setCommentsLoading(true);
      try {
        const data = await api.getComments(currentPerson.id);
        setComments(data);
      } catch (err) {
        console.error("Failed to load comments:", err);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [currentIndex, people]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % people.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + people.length) % people.length);
  };

  const handleEditComment = async (
    commentId: number,
    newText: string
  ) => {
    const editToken = tokenStorage.getEditToken(commentId);
    if (!editToken) {
      alert("Edit token not found. You may have cleared your browser data.");
      return;
    }

    try {
      await api.updateComment(commentId, newText, editToken);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, text: newText } : c
        )
      );
      setEditingCommentId(null);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update comment"
      );
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;

    const editToken = tokenStorage.getEditToken(commentId);
    if (!editToken) {
      alert("Edit token not found. You may have cleared your browser data.");
      return;
    }

    try {
      await api.deleteComment(commentId, editToken);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      tokenStorage.deleteEditToken(commentId);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete comment"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">No people to display</p>
      </div>
    );
  }

  const currentPerson = people[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Slideshow */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <img
              src={currentPerson.imageUrl}
              alt={currentPerson.name}
              className="w-full h-96 object-contain bg-gray-100"
            />

            {/* Person Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-6 text-white">
              <h2 className="text-3xl font-bold">{currentPerson.name}</h2>
              {currentPerson.major && (
                <p className="text-lg opacity-90">{currentPerson.major}</p>
              )}
              <p className="text-lg opacity-90">Class of {currentPerson.year}</p>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition-all"
              aria-label="Previous"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition-all"
              aria-label="Next"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Slide Counter */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {people.length}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-6">Comments</h3>

          {!isReleased ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
              <p className="font-semibold">Gallery Not Released Yet</p>
              <p className="text-sm mt-1">
                Check back later to see comments from others.
              </p>
            </div>
          ) : (
            <div>
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const hasEditToken =
                      !!tokenStorage.getEditToken(comment.id);

                    return (
                      <div
                        key={comment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <p className="text-gray-900 mb-2">{comment.text}</p>
                        <p className="text-xs text-gray-500 mb-3">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>

                        {hasEditToken && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingText(comment.text);
                              }}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteComment(comment.id)
                              }
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingCommentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Edit Comment</h3>
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingCommentId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleEditComment(editingCommentId, editingText)
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
