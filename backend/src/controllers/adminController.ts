import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    // Role breakdown
    const [adminCount, normalUserCount, storeOwnerCount] = await Promise.all([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "STORE_OWNER" } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
        breakdown: {
          admins: adminCount,
          users: normalUserCount,
          storeOwners: storeOwnerCount,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard statistics" });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "A user with this email address already exists",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `User created successfully as ${role}`,
      data: { user },
    });
  } catch (error) {
    console.error("Admin createUser error:", error);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner) {
        res.status(400).json({ success: false, message: "Selected store owner does not exist" });
        return;
      }

      if (owner.role !== "STORE_OWNER") {
        res.status(400).json({
          success: false,
          message: "Assigned owner must have the STORE_OWNER role",
        });
        return;
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email: email.toLowerCase(),
        address,
        ownerId: ownerId || null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: { store },
    });
  } catch (error) {
    console.error("Admin createStore error:", error);
    res.status(500).json({ success: false, message: "Failed to create store" });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, address, role, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const where: any = {};

    if (name && typeof name === "string" && name.trim()) {
      where.name = { contains: name.trim() };
    }
    if (email && typeof email === "string" && email.trim()) {
      where.email = { contains: email.trim().toLowerCase() };
    }
    if (address && typeof address === "string" && address.trim()) {
      where.address = { contains: address.trim() };
    }
    if (role && typeof role === "string" && role.trim()) {
      where.role = role.trim();
    }

    // Fetch users with their stores and store ratings
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    // Compute rating for store owners
    const enrichedUsers = users.map((user) => {
      let storeRating: number | null = null;
      let totalRatingsCount = 0;

      if (user.role === "STORE_OWNER" && user.stores && user.stores.length > 0) {
        const allRatings = user.stores.flatMap((s) => s.ratings.map((r) => r.rating));
        totalRatingsCount = allRatings.length;
        if (allRatings.length > 0) {
          const sum = allRatings.reduce((acc, curr) => acc + curr, 0);
          storeRating = parseFloat((sum / allRatings.length).toFixed(2));
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        stores: user.stores.map((s) => ({ id: s.id, name: s.name })),
        storeRating,
        totalRatingsCount,
      };
    });

    // Sort in memory (especially for storeRating which is computed)
    const validSortFields = ["name", "email", "address", "role", "createdAt", "storeRating"];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : "createdAt";
    const order = sortOrder === "asc" ? 1 : -1;

    enrichedUsers.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "string") {
        return valA.localeCompare(valB) * order;
      }
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });

    res.status(200).json({
      success: true,
      data: {
        users: enrichedUsers,
        totalCount: enrichedUsers.length,
      },
    });
  } catch (error) {
    console.error("Admin getUsers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const getStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, address, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const where: any = {};

    if (name && typeof name === "string" && name.trim()) {
      where.name = { contains: name.trim() };
    }
    if (email && typeof email === "string" && email.trim()) {
      where.email = { contains: email.trim().toLowerCase() };
    }
    if (address && typeof address === "string" && address.trim()) {
      where.address = { contains: address.trim() };
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    const enrichedStores = stores.map((store) => {
      const count = store.ratings.length;
      const avg =
        count > 0
          ? parseFloat(
              (store.ratings.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2)
            )
          : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        rating: avg,
        ratingCount: count,
        createdAt: store.createdAt,
      };
    });

    // Sorting
    const validSortFields = ["name", "email", "address", "rating", "ratingCount", "createdAt"];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : "createdAt";
    const order = sortOrder === "asc" ? 1 : -1;

    enrichedStores.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "string") {
        return valA.localeCompare(valB) * order;
      }
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });

    res.status(200).json({
      success: true,
      data: {
        stores: enrichedStores,
        totalCount: enrichedStores.length,
      },
    });
  } catch (error) {
    console.error("Admin getStores error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stores" });
  }
};

export const getStoreOwnersList = async (req: Request, res: Response): Promise<void> => {
  try {
    const storeOwners = await prisma.user.findMany({
      where: { role: "STORE_OWNER" },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      data: { storeOwners },
    });
  } catch (error) {
    console.error("getStoreOwnersList error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch store owners" });
  }
};
