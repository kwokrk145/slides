import { Router, Request, Response } from "express";
import prisma from "../db.js";
import { adminMiddleware } from "../middleware/auth.js";

const router: Router = Router();

/**
 * GET /api/admin/people
 * Get all people (admin only)
 */
router.get("/people", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const people = await prisma.person.findMany({
      include: {
        comments: {
          select: { id: true },
        },
      },
      orderBy: { id: "asc" },
    });

    const peopleWithCounts = people.map((person) => ({
      ...person,
      commentCount: person.comments.length,
      comments: undefined,
    }));

    res.json(peopleWithCounts);
  } catch (error) {
    console.error("Error fetching people:", error);
    res.status(500).json({ error: "Failed to fetch people" });
  }
});

/**
 * POST /api/admin/people
 * Add a new person (admin only)
 *
 * Body: {
 *   name: string,
 *   major: string,
 *   year: number,
 *   imageUrl: string
 * }
 */
router.post("/people", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, major, year, imageUrl } = req.body;

    if (!name || !major || !year || !imageUrl) {
      return res.status(400).json({
        error: "name, major, year, and imageUrl are required",
      });
    }

    if (typeof year !== "number" || year < 1900 || year > 2100) {
      return res.status(400).json({ error: "Invalid year" });
    }

    const person = await prisma.person.create({
      data: {
        name: name.trim(),
        major: major.trim(),
        year,
        imageUrl: imageUrl.trim(),
      },
    });

    res.status(201).json({
      ...person,
      message: "Person added successfully",
    });
  } catch (error) {
    console.error("Error creating person:", error);
    res.status(500).json({ error: "Failed to create person" });
  }
});

/**
 * DELETE /api/admin/people/:personId
 * Remove a person (admin only)
 * This will cascade delete all their comments
 */
router.delete(
  "/people/:personId",
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const personId = parseInt(req.params.personId);

      if (isNaN(personId)) {
        return res.status(400).json({ error: "Invalid personId" });
      }

      const person = await prisma.person.findUnique({
        where: { id: personId },
        include: {
          comments: { select: { id: true } },
        },
      });

      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }

      await prisma.person.delete({
        where: { id: personId },
      });

      res.json({
        message: `Person deleted successfully (${person.comments.length} comments removed)`,
      });
    } catch (error) {
      console.error("Error deleting person:", error);
      res.status(500).json({ error: "Failed to delete person" });
    }
  }
);

/**
 * PUT /api/admin/people/:personId
 * Update a person (admin only)
 *
 * Body: {
 *   name?: string,
 *   major?: string,
 *   year?: number,
 *   imageUrl?: string
 * }
 */
router.put(
  "/people/:personId",
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const personId = parseInt(req.params.personId);
      const { name, major, year, imageUrl } = req.body;

      if (isNaN(personId)) {
        return res.status(400).json({ error: "Invalid personId" });
      }

      const person = await prisma.person.findUnique({
        where: { id: personId },
      });

      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }

      const updated = await prisma.person.update({
        where: { id: personId },
        data: {
          ...(name && { name: name.trim() }),
          ...(major && { major: major.trim() }),
          ...(year && { year }),
          ...(imageUrl && { imageUrl: imageUrl.trim() }),
        },
      });

      res.json({
        ...updated,
        message: "Person updated successfully",
      });
    } catch (error) {
      console.error("Error updating person:", error);
      res.status(500).json({ error: "Failed to update person" });
    }
  }
);

export default router;
