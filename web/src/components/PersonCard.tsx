import React, { useState } from "react";


interface PersonCardProps {
  name: string;
  major?: string;
  year: number;
  imageUrl: string;
  commentCount: number;
  onSubmitComment: (text: string) => Promise<void>;
  isLoading?: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({
  name,
  major,
  year,
  imageUrl,
  commentCount,
  onSubmitComment,
  isLoading = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!commentText.trim()) {
      setErrorMessage("Comment cannot be empty");
      return;
    }

    setSubmitStatus("loading");
    setErrorMessage("");

    try {
      await onSubmitComment(commentText);
      setSubmitStatus("success");
      setCommentText("");
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus("idle");
      }, 1500);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit comment"
      );
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow disabled:opacity-50"
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-64 object-cover"
        />
        <div className="p-4">
          <h3 className="font-bold text-lg">{name}</h3>
          {major && <p className="text-sm text-gray-700">{major}</p>}
          <p className="text-sm text-gray-600">Class of {year}</p>
          <p className="text-xs text-gray-500 mt-2">{commentCount} comments</p>
        </div>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="mb-4">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-56 object-cover rounded-md mb-4"
              />
              <h2 className="font-bold text-xl">{name}</h2>
              {major && <p className="text-gray-700">{major}</p>}
              <p className="text-sm text-gray-600">Class of {year}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                disabled={submitStatus === "loading"}
                className="w-full h-24 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />

              {errorMessage && (
                <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
              )}

              {submitStatus === "success" && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Comment posted! Your edit token has been saved.
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitStatus === "loading"}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitStatus === "loading"}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitStatus === "loading" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Submit Comment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonCard;
