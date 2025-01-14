import { useState } from "react";
import { TextInput } from "../TextInput";
import { useProductsQuery } from "../../api/useProductsQuery";
import { Dropdown } from "../Dropdown";
import { Spinner } from "../Spinner";
import { Link } from "react-router-dom";
import { useDebounce } from "../../helpers/useDebounce";

export const SearchBar = () => {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const debouncedValue = useDebounce(value, 500);
  const { data, isPending } = useProductsQuery(
    {
      nameContains: debouncedValue ? debouncedValue : undefined,
      resultCount: 3,
    },
    { enabled: !!debouncedValue },
  );

  const results = data?.pages?.[0]?.results;

  const items = isPending
    ? [
        <div className="flex justify-center">
          <Spinner status="primary" />
        </div>,
      ]
    : results.length === 0
      ? [
          <div className="text-center">
            Žádné produkty neodpovídají hledanému výrazu
          </div>,
        ]
      : results.map((product) => (
          <Link to={`/products/${product.id}`} className="block py-2">
            <div className="flex gap-4 w-full text-left items-center text-black">
              <img
                src={`${import.meta.env.VITE_API_URL}/products/${product.id}/image`}
                className="shrink-0 size-12 object-cover rounded-lg"
              />
              <div className="flex flex-col">
                <div className="text-lg">{product.title}</div>
                <div>{product.description.substring(0, 40)}</div>
              </div>
            </div>
          </Link>
        ));

  return (
    <div className="flex justify-end">
      <div className="grow max-w-80">
        <Dropdown
          className="w-full"
          open={!!value && isOpen}
          items={items}
          dropdownClassName="w-full"
        >
          <TextInput
            placeholder="Vyhledávání"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() =>
              setTimeout(
                () => setIsOpen(false),
                100, // Time to navigate
              )
            }
          />
        </Dropdown>
      </div>
    </div>
  );
};
