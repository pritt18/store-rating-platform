export type UserRole = "ADMIN" | "USER" | "STORE_OWNER";

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt: string;
  storeRating?: number | null;
  totalRatingsCount?: number;
  stores?: Array<{ id: number; name: string }>;
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  overallRating?: number | null;
  ratingCount?: number;
  myRating?: number | null;
  myRatingId?: number | null;
  createdAt: string;
  owner?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface RaterInfo {
  id: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    address: string;
  };
}

export interface OwnerDashboardData {
  store: {
    id: number;
    name: string;
    email: string;
    address: string;
  } | null;
  averageRating: number | null;
  totalRatings: number;
  raters: RaterInfo[];
  message?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  breakdown: {
    admins: number;
    users: number;
    storeOwners: number;
  };
}
