import { Star } from "lucide-react";

interface ReviewCardProps {
  review: {
    rating: number;
    comment?: string;
    createdAt: string;
    author: {
      profile?: {
        firstName: string;
        lastName: string;
        avatarUrl?: string | null;
      };
    };
    booking?: {
      serviceType?: string;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {review.author.profile?.firstName?.[0] || "?"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {review.author.profile?.firstName} {review.author.profile?.lastName}
            </p>
            {review.booking?.serviceType && (
              <p className="text-xs text-gray-500">{review.booking.serviceType}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
            }`}
          />
        ))}
      </div>
      {review.comment && (
        <p className="text-gray-600 text-sm">{review.comment}</p>
      )}
    </div>
  );
}