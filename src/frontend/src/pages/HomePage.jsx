import { Button } from "../components/Button";
import { Link } from "react-router-dom";
import homePagelllustration from "../assets/home-page-illustration.webp";
import { ProductsList } from "../components/ProductsList.jsx";
import { Hero } from "../components/Hero.jsx";

export const HomePage = () => {
  return (
    <div className="max-w-screen-lg mx-auto flex flex-col gap-14">
      <Hero />
      <div className="bg-gray-100 py-5 rounded-xl shadow">
        <h2 className="text-center md:text-left text-3xl">
          🔥Populární produkty
        </h2>
        <div className="mt-4">
          <ProductsList
            display="horizontal"
            hasPager={false}
            filter={{ order: "desc", resultCount: 3, minRating: 0 }}
            className={
              "flex-col md:flex-row items-center md:items-stretch flex-wrap"
            }
            productClassNames={"grow basis-80 w-full sm:max-w-76"}
          ></ProductsList>
        </div>
      </div>
    </div>
  );
};
