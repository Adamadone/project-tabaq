export const StarRatingInput = ({ value, onChange }) => {
  return (
    <div>
      <div className="rating rating-md">
        {new Array(5).fill(null).map((_, index) => (
          <input
            key={index}
            checked={index + 1 === value}
            type="radio"
            className="mask mask-star-2 bg-orange-400"
            onChange={() => onChange(index + 1)}
          />
        ))}
      </div>
    </div>
  );
};
