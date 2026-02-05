import { Request, Response, NextFunction } from "express";

// Extend Express Request to include custom properties
declare global {
  namespace Express {
    interface Request {
      editToken?: string;
      isAdmin?: boolean;
    }
  }
}

/**
 * Admin password middleware
 * Checks for Authorization header with Bearer token matching ADMIN_PASSWORD
 */
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn("ADMIN_PASSWORD not set in environment");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization" });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (token !== adminPassword) {
    return res.status(403).json({ error: "Invalid admin password" });
  }

  req.isAdmin = true;
  next();
};

/**
 * Edit token middleware
 * Extracts edit token from Authorization header for comment operations
 */
export const editTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    req.editToken = authHeader.substring(7);
  }

  next();
};
