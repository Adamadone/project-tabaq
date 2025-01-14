import { Link } from "react-router-dom";

export const Hero = ({}) => {
  return (
    <div className="hero bg-base-200 min-h-20 rounded-box">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src={`${new URL("../assets/home-page-illustration.webp", import.meta.url).href}`}
          className="max-w-sm rounded-lg shadow-2xl"
        />
        <div>
          <h1 className="text-5xl font-bold">TabaQ</h1>
          <p className="py-6 text-2xl">
            Tabáky, značky, hodnocení, vše na jednom místě.
          </p>
          <Link to="/products" className="btn btn-primary">
            Produkty
          </Link>
        </div>
      </div>
    </div>
  );
};
