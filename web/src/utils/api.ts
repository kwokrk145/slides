const API_BASE_URL = import.meta.env.VITE_API_URL || "https://slides-vdwo.onrender.com/";

interface ApiError {
  error: string;
}

export const api = {
  /**
   * Submit a new comment
   */
  async submitComment(
    personId: number,
    text: string
  ): Promise<{ id: number; editToken: string }> {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId, text }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to submit comment");
    }

    return response.json();
  },

  /**
   * Get all comments for a person
   */
  async getComments(personId: number): Promise<
    Array<{
      id: number;
      text: string;
      createdAt: string;
    }>
  > {
    const response = await fetch(
      `${API_BASE_URL}/comments/${personId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }

    return response.json();
  },

  /**
   * Update a comment
   */
  async updateComment(
    commentId: number,
    text: string,
    editToken: string
  ): Promise<{ id: number; text: string; updatedAt: string }> {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${editToken}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to update comment");
    }

    return response.json();
  },

  /**
   * Delete a comment
   */
  async deleteComment(
    commentId: number,
    editToken: string
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${editToken}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to delete comment");
    }

    return response.json();
  },

  /**
   * Get gallery release state
   */
  async getGalleryState(): Promise<{ isReleased: boolean }> {
    const response = await fetch(`${API_BASE_URL}/gallery/state`);

    if (!response.ok) {
      throw new Error("Failed to fetch gallery state");
    }

    return response.json();
  },

  /**
   * Get all people
   */
  async getPeople(): Promise<
    Array<{
      id: number;
      name: string;
      major?: string;
      year: number;
      imageUrl: string;
      commentCount: number;
    }>
  > {
    const response = await fetch(`${API_BASE_URL}/gallery/people`);

    if (!response.ok) {
      throw new Error("Failed to fetch people");
    }

    return response.json();
  },

  /**
   * Update gallery state (admin only)
   */
  async updateGalleryState(
    isReleased: boolean,
    adminPassword: string
  ): Promise<{ isReleased: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/gallery/state`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminPassword}`,
      },
      body: JSON.stringify({ isReleased }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to update gallery state");
    }

    return response.json();
  },

  /**
   * Get all people (admin only)
   */
  async getAdminPeople(
    adminPassword: string
  ): Promise<
    Array<{
      id: number;
      name: string;
      major: string;
      year: number;
      imageUrl: string;
      commentCount: number;
    }>
  > {
    const response = await fetch(`${API_BASE_URL}/admin/people`, {
      headers: {
        Authorization: `Bearer ${adminPassword}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch people");
    }

    return response.json();
  },

  /**
   * Add a new person (admin only)
   */
  async addPerson(
    data: {
      name: string;
      major: string;
      year: number;
      imageUrl: string;
    },
    adminPassword: string
  ): Promise<{ id: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/people`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminPassword}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to add person");
    }

    return response.json();
  },

  /**
   * Remove a person (admin only)
   */
  async removePerson(
    personId: number,
    adminPassword: string
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/people/${personId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminPassword}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to remove person");
    }

    return response.json();
  },
};

/**
 * Local storage tokens management
 */
export const tokenStorage = {
  saveEditToken(commentId: number, token: string) {
    const tokens = this.getAllTokens();
    tokens[commentId] = token;
    localStorage.setItem("commentTokens", JSON.stringify(tokens));
  },

  getEditToken(commentId: number): string | null {
    const tokens = this.getAllTokens();
    return tokens[commentId] || null;
  },

  getAllTokens(): Record<number, string> {
    const stored = localStorage.getItem("commentTokens");
    return stored ? JSON.parse(stored) : {};
  },

  deleteEditToken(commentId: number) {
    const tokens = this.getAllTokens();
    delete tokens[commentId];
    localStorage.setItem("commentTokens", JSON.stringify(tokens));
  },
};
