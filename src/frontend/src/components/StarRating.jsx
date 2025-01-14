import { useId } from "react";

export const StarRating = ({ rating }) => {
  const id = useId();
  const roundedRating = Math.round(rating);
  return (
    <div>
      <div className="rating rating-md">
        {new Array(5).fill(null).map((_, index) => (
          <input
            key={index}
            type="radio"
            name={`rating-${id}`}
            disabled
            checked={index + 1 === roundedRating}
            readOnly
            className="mask mask-star-2 bg-orange-400 cursor-default"
          />
        ))}
      </div>
    </div>
  );
};
