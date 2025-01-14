import React, { Fragment, useState } from "react";
import { TagsPicker } from "../pages/products/ProductsPage/TagsPicker.jsx";
import { Dropdown } from "./Dropdown.jsx";

const defaultFilter = {
  rating: {
    selected: true,
    tabTitle: "Hodnocení",
    value: undefined,
  },
  tags: {
    selected: false,
    tabTitle: "Tagy",
    value: undefined,
  },
};

const ratingFilterConditions = [
  {
    value: "gt",
    display: "větší než",
  },
  {
    value: "gte",
    display: "větší nebo rovno",
  },
  {
    value: "lt",
    display: "menší než",
  },
  {
    value: "lte",
    display: "menší nebo rovno",
  },
];

const TagsFilterControl = ({ attrKey, onValueChange }) => {
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagsChange = (newSelectedTags) => {
    setSelectedTags(newSelectedTags);

    onValueChange && onValueChange(attrKey, { in: newSelectedTags });
  };

  return (
    <div className="flex flex-row justify-start gap-4">
      <TagsPicker
        onChange={handleTagsChange}
        selected={selectedTags}
      ></TagsPicker>
    </div>
  );
};

const RatingFilterControl = ({ attrKey, onValueChange }) => {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
  const [currentCondition, setCurrentCondition] = useState(
    ratingFilterConditions[0],
  );
  const [conditionValue, setConditionValue] = useState(0);

  const handleConditionSelect = (index) => {
    setCurrentCondition(ratingFilterConditions[index]);
    setDropdownIsOpen(false);
    const newValue =
      conditionValue === undefined || conditionValue === ""
        ? undefined
        : conditionValue;
    onValueChange &&
      onValueChange(attrKey, {
        [ratingFilterConditions[index].value]: newValue,
      });
  };

  const handleValueCHange = (ev) => {
    setConditionValue(ev.target.value);
    const newValue =
      !ev.target.value || ev.target.value === "" ? undefined : ev.target.value;
    onValueChange &&
      onValueChange(attrKey, { [currentCondition.value]: newValue });
  };

  const mappedDropdownOptions = ratingFilterConditions.map(
    (filterCondition, index) => {
      return (
        <div
          role="button"
          onClick={() => {
            handleConditionSelect(index);
          }}
        >
          {filterCondition.display}
        </div>
      );
    },
  );

  return (
    <div className="flex flex-wrap flex-column items-center justify-start gap-4 w-full">
      <span>Hodnocení: </span>
      <Dropdown open={dropdownIsOpen} items={mappedDropdownOptions}>
        <div
          className="cursor-pointer btn m-1"
          tabIndex={0}
          onClick={() => {
            setDropdownIsOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setDropdownIsOpen(false);
            }, 300);
          }}
        >
          {currentCondition.display}
        </div>
      </Dropdown>
      <input
        type="number"
        placeholder="zadejte hodonocení"
        value={conditionValue}
        onChange={handleValueCHange}
        className="input input-bordered"
      />
    </div>
  );
};

const filterablePropertyControlMap = new Map([
  ["rating", RatingFilterControl],
  ["tags", TagsFilterControl],
]);

const FilterTabs = ({ filterTabs, onTabSelected, onFilterValueChanged }) => {
  const handleTabSelected = (tabName) => {
    onTabSelected && onTabSelected(tabName);
  };

  return (
    <div role="tablist" className="tabs tabs-lifted">
      {Object.keys(filterTabs).map((filterAttribute) => {
        const filterTab = filterTabs[filterAttribute];

        return (
          <Fragment key={filterAttribute}>
            <input
              type="radio"
              role="tab"
              className="tab"
              aria-label={filterTab.tabTitle}
              checked={filterTab.selected}
              onChange={() => {
                handleTabSelected(filterAttribute);
              }}
            />
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              {filterablePropertyControlMap.get(filterAttribute)({
                attrKey: filterAttribute,
                onValueChange: onFilterValueChanged,
              })}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

export const ProductsFilter = ({ className, style, onFilterSave }) => {
  const [currentFilter, setCurrentFilter] = useState(defaultFilter);

  const handleTabSelect = (tabName) => {
    setCurrentFilter((prevFilter) => {
      Object.values(prevFilter).forEach((filter) => (filter.selected = false));
      prevFilter[tabName].selected = true;

      return { ...prevFilter };
    });
  };

  const handleFilterSave = () => {
    onFilterSave &&
      (() => {
        const filterWithNoSelected = {};

        Object.keys(currentFilter).forEach(
          (filterKey) =>
            (filterWithNoSelected[filterKey] = currentFilter[filterKey].value),
        );

        onFilterSave(filterWithNoSelected);
      })();
  };

  const handleFilterValueChange = (attrKey, newFilterValue) => {
    currentFilter[attrKey].value = newFilterValue;
  };

  return (
    <div
      className={`collapse collapse-arrow overflow-visible ${className}`}
      style={{ ...style }}
    >
      <input type="checkbox" />
      <div className="collapse-title text-md font-medium">Filtr</div>
      <div className="collapse-content">
        <FilterTabs
          filterTabs={currentFilter}
          onTabSelected={handleTabSelect}
          onFilterValueChanged={handleFilterValueChange}
        ></FilterTabs>
        <div className="flex justify-end">
          <button className="btn btn-neutral mt-4" onClick={handleFilterSave}>
            Použít filtr
          </button>
        </div>
      </div>
    </div>
  );
};
