import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../db.js";
import { editTokenMiddleware } from "../middleware/auth.js";

const router: Router = Router();

router.use(editTokenMiddleware);

/**
 * POST /api/comments
 * Submit a new comment
 *
 * Body: {
 *   personId: number,
 *   text: string
 * }
 *
 * Returns: {
 *   id: number,
 *   editToken: string
 * }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { personId, text } = req.body;

    if (!personId || !text) {
      return res
        .status(400)
        .json({ error: "personId and text are required" });
    }

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }

    // Verify person exists
    const person = await prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    const editToken = uuidv4();

    const comment = await prisma.comment.create({
      data: {
        personId,
        text: text.trim(),
        editToken,
      },
    });

    res.status(201).json({
      id: comment.id,
      editToken,
      message: "Comment created successfully",
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

/**
 * GET /api/comments/:personId
 * Get all comments for a person
 * Returns only non-deleted comments
 */
router.get("/:personId", async (req: Request, res: Response) => {
  try {
    const personId = parseInt(req.params.personId);

    if (isNaN(personId)) {
      return res.status(400).json({ error: "Invalid personId" });
    }

    const comments = await prisma.comment.findMany({
      where: {
        personId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        // Don't expose edit token in GET requests for security
      },
    });

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

/**
 * PUT /api/comments/:commentId
 * Update a comment (requires valid edit token)
 *
 * Headers: Authorization: Bearer <editToken>
 * Body: { text: string }
 */
router.put("/:commentId", async (req: Request, res: Response) => {
  try {
    if (!req.editToken) {
      return res.status(401).json({ error: "Edit token required" });
    }

    const commentId = parseInt(req.params.commentId);
    const { text } = req.body;

    if (isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid commentId" });
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.editToken !== req.editToken) {
      return res
        .status(403)
        .json({ error: "Unauthorized: Invalid edit token" });
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { text: text.trim() },
      select: {
        id: true,
        text: true,
        updatedAt: true,
      },
    });

    res.json({
      ...updated,
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

/**
 * DELETE /api/comments/:commentId
 * Soft delete a comment (mark as deleted, never actually remove)
 * Requires valid edit token
 *
 * Headers: Authorization: Bearer <editToken>
 */
router.delete("/:commentId", async (req: Request, res: Response) => {
  try {
    if (!req.editToken) {
      return res.status(401).json({ error: "Edit token required" });
    }

    const commentId = parseInt(req.params.commentId);

    if (isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid commentId" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.editToken !== req.editToken) {
      return res
        .status(403)
        .json({ error: "Unauthorized: Invalid edit token" });
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
