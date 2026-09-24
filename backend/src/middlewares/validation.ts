import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Password regex: 8-16 chars, at least one uppercase letter, at least one special character
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,16}$/;

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(20, "Name must be at least 20 characters")
    .max(60, "Name must not exceed 60 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  address: z
    .string({ required_error: "Address is required" })
    .trim()
    .max(400, "Address must not exceed 400 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .regex(
      passwordRegex,
      "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
    ),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .regex(
      passwordRegex,
      "New password must be 8-16 characters and contain at least one uppercase letter and one special character"
    ),
});

export const adminCreateUserSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(20, "Name must be at least 20 characters")
    .max(60, "Name must not exceed 60 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  address: z
    .string({ required_error: "Address is required" })
    .trim()
    .max(400, "Address must not exceed 400 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .regex(
      passwordRegex,
      "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
    ),
  role: z.enum(["ADMIN", "USER", "STORE_OWNER"], {
    errorMap: () => ({ message: "Role must be one of: ADMIN, USER, STORE_OWNER" }),
  }),
});

export const createStoreSchema = z.object({
  name: z
    .string({ required_error: "Store name is required" })
    .trim()
    .min(3, "Store name must be at least 3 characters")
    .max(60, "Store name must not exceed 60 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  address: z
    .string({ required_error: "Address is required" })
    .trim()
    .max(400, "Address must not exceed 400 characters"),
  ownerId: z.coerce.number().optional().nullable(),
});

export const ratingSchema = z.object({
  rating: z
    .coerce
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
});

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          message: errors[0]?.message || "Validation failed",
          errors,
        });
        return;
      }
      res.status(400).json({ success: false, message: "Invalid request payload" });
    }
  };
};
