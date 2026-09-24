import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number | null;
  maxStars?: number;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  onChange?: (newRating: number) => void;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxStars = 5,
  interactive = false,
  size = "md",
  onChange,
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const currentVal = hoverRating !== null ? hoverRating : rating || 0;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starNumber = idx + 1;
          const isFilled = starNumber <= Math.round(currentVal);

          return (
            <button
              key={idx}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starNumber)}
              onMouseEnter={() => interactive && setHoverRating(starNumber)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${
                interactive
                  ? "cursor-pointer hover:scale-110 transition-transform focus:outline-none"
                  : "cursor-default pointer-events-none"
              } p-0.5`}
              aria-label={`Rate ${starNumber} of ${maxStars} stars`}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors ${
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-100 text-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {rating !== null && rating !== undefined ? Number(rating).toFixed(1) : "N/A"}
        </span>
      )}
    </div>
  );
};
