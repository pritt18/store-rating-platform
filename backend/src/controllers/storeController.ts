import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middlewares/auth";

export const getAllStores = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, name, address, sortBy = "name", sortOrder = "asc" } = req.query;
    const currentUserId = req.user?.id;

    const where: any = {};

    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { address: { contains: q } },
      ];
    } else {
      if (name && typeof name === "string" && name.trim()) {
        where.name = { contains: name.trim() };
      }
      if (address && typeof address === "string" && address.trim()) {
        where.address = { contains: address.trim() };
      }
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
          },
        },
      },
    });

    const enrichedStores = stores.map((store) => {
      const count = store.ratings.length;
      const overallRating =
        count > 0
          ? parseFloat(
              (store.ratings.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2)
            )
          : null;

      // Find user's submitted rating if user is logged in
      const userRatingObj = currentUserId
        ? store.ratings.find((r) => r.userId === currentUserId)
        : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        ratingCount: count,
        myRating: userRatingObj ? userRatingObj.rating : null,
        myRatingId: userRatingObj ? userRatingObj.id : null,
        createdAt: store.createdAt,
      };
    });

    // Sort stores
    const validSortFields = ["name", "email", "address", "overallRating", "ratingCount", "myRating", "createdAt"];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : "name";
    const order = sortOrder === "desc" ? -1 : 1;

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
    console.error("getAllStores error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stores" });
  }
};

export const rateStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const storeId = parseInt(req.params.storeId, 10);
    if (isNaN(storeId)) {
      res.status(400).json({ success: false, message: "Invalid store ID" });
      return;
    }

    const { rating } = req.body;
    const ratingValue = parseInt(rating, 10);

    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      res.status(400).json({ success: false, message: "Rating must be an integer between 1 and 5" });
      return;
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      res.status(404).json({ success: false, message: "Store not found" });
      return;
    }

    // Upsert rating (user can submit or modify their rating)
    const submittedRating = await prisma.rating.upsert({
      where: {
        user_store_unique: {
          userId: req.user.id,
          storeId,
        },
      },
      update: {
        rating: ratingValue,
      },
      create: {
        userId: req.user.id,
        storeId,
        rating: ratingValue,
      },
    });

    // Recompute store average
    const allRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });

    const newAvg = parseFloat(
      (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(2)
    );

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        rating: submittedRating.rating,
        overallRating: newAvg,
        ratingCount: allRatings.length,
      },
    });
  } catch (error) {
    console.error("rateStore error:", error);
    res.status(500).json({ success: false, message: "Failed to submit rating" });
  }
};

export const getOwnerDashboard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { sortBy = "createdAt", sortOrder = "desc", search } = req.query;

    // Find the store(s) owned by this user
    const stores = await prisma.store.findMany({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!stores || stores.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          store: null,
          message: "No store assigned to your account yet. Contact an administrator.",
          averageRating: null,
          totalRatings: 0,
          raters: [],
        },
      });
      return;
    }

    // For single or primary store
    const primaryStore = stores[0];
    const totalRatings = primaryStore.ratings.length;
    const averageRating =
      totalRatings > 0
        ? parseFloat(
            (primaryStore.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
          )
        : null;

    let raters = primaryStore.ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    // Filter raters by search query if provided
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      raters = raters.filter(
        (r) =>
          r.user.name.toLowerCase().includes(q) ||
          r.user.email.toLowerCase().includes(q)
      );
    }

    // Sort raters
    const validSortFields = ["name", "email", "rating", "createdAt"];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : "createdAt";
    const order = sortOrder === "asc" ? 1 : -1;

    raters.sort((a: any, b: any) => {
      let valA: any;
      let valB: any;

      if (sortField === "name") {
        valA = a.user.name;
        valB = b.user.name;
      } else if (sortField === "email") {
        valA = a.user.email;
        valB = b.user.email;
      } else if (sortField === "rating") {
        valA = a.rating;
        valB = b.rating;
      } else {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

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
        store: {
          id: primaryStore.id,
          name: primaryStore.name,
          email: primaryStore.email,
          address: primaryStore.address,
        },
        averageRating,
        totalRatings,
        raters,
      },
    });
  } catch (error) {
    console.error("getOwnerDashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch owner store dashboard" });
  }
};
