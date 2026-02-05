import { Router, Request, Response } from "express";
import prisma from "../db.js";
import { adminMiddleware } from "../middleware/auth.js";

const router: Router = Router();

/**
 * GET /api/gallery/state
 * Get current gallery release state
 * Public endpoint - no auth required
 */
router.get("/state", async (req: Request, res: Response) => {
  try {
    let state = await prisma.galleryState.findUnique({
      where: { id: 1 },
    });

    // Create default state if it doesn't exist
    if (!state) {
      state = await prisma.galleryState.create({
        data: { id: 1, isReleased: false },
      });
    }

    res.json({ isReleased: state.isReleased });
  } catch (error) {
    console.error("Error fetching gallery state:", error);
    res.status(500).json({ error: "Failed to fetch gallery state" });
  }
});

/**
 * GET /api/gallery/people
 * Get all people with their comment counts
 * Public endpoint
 */
router.get("/people", async (req: Request, res: Response) => {
  try {
    const people = await prisma.person.findMany({
      include: {
        comments: {
          where: { isDeleted: false },
          select: { id: true },
        },
      },
      orderBy: { id: "asc" },
    });

    const peopleWithCounts = people.map((person) => ({
      ...person,
      commentCount: person.comments.length,
      comments: undefined, // Remove comments array from response
    }));

    res.json(peopleWithCounts);
  } catch (error) {
    console.error("Error fetching people:", error);
    res.status(500).json({ error: "Failed to fetch people" });
  }
});

/**
 * PUT /api/gallery/state
 * Toggle gallery release state (admin only)
 *
 * Headers: Authorization: Bearer <ADMIN_PASSWORD>
 * Body: { isReleased: boolean }
 */
router.put("/state", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { isReleased } = req.body;

    if (typeof isReleased !== "boolean") {
      return res.status(400).json({ error: "isReleased must be boolean" });
    }

    const state = await prisma.galleryState.upsert({
      where: { id: 1 },
      update: { isReleased },
      create: { id: 1, isReleased },
    });

    res.json({
      isReleased: state.isReleased,
      message: `Gallery ${isReleased ? "released" : "hidden"}`,
    });
  } catch (error) {
    console.error("Error updating gallery state:", error);
    res.status(500).json({ error: "Failed to update gallery state" });
  }
});

export default router;
