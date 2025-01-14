import { useRef, useState } from "react";

import { Button } from "../components/Button";
import { Dropdown } from "../components/Dropdown";
import { Spinner } from "../components/Spinner";

import { Tag } from "./Tag";
import { useTagsQuery } from "../api/useTagsQuery";

export const TagsInput = ({ label, value, onChange }) => {
  const [state, setState] = useState({
    searchText: null,
  });
  const inputRef = useRef(null);
  const { data, isPending, error } = useTagsQuery({
    nameContains: state.searchText,
    limit: 3,
  });

  const handleChange = async (e) => {
    const searchText = e.target.value;
    setState((prevState) => ({ ...prevState, searchText }));
  };

  const handleInputContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBlur = () => {
    setTimeout(
      () => setState((prevState) => ({ ...prevState, searchText: null })),
      200,
    );
  };

  const handleCreateTag = async () => {
    if (!state.searchText) return;

    onChange([...value, state.searchText]);
  };

  const handleSelectTag = (tag) => {
    if (value.includes(tag.name)) return;
    setState((prevState) => ({
      ...prevState,
      searchText: null,
    }));
    onChange([...value, tag.name]);
  };

  const handleRemoveTag = (tagToRemove) => {
    const filteredOutTags = value.filter((tag) => tag !== tagToRemove);

    onChange(filteredOutTags);
  };

  const doesSearchedTagAlreadyExists =
    !!data?.results.find((tag) => tag.name === state.searchText) ||
    !!value?.find((tag) => tag === state.searchText);

  const createNewTagOption = !doesSearchedTagAlreadyExists
    ? [
        <Button
          key="__newTag"
          onClick={async (e) => {
            e.preventDefault();
            await handleCreateTag();
          }}
        >
          {`Vytvořit nový tag: ${state.searchText}`}
        </Button>,
      ]
    : [];

  const foundTagsMappedToOptions = data?.results.map((tag) => (
    <Button
      key={tag.id}
      variant="basic"
      onClick={(e) => {
        e.preventDefault();
        handleSelectTag(tag);
      }}
    >
      {tag.name}
    </Button>
  ));

  const dropdownOptions = isPending
    ? [
        <div key="__loading">
          <Spinner key="spinner" status="primary" />
        </div>,
      ]
    : error
      ? ["Nastala neočekávaná chyba"]
      : [...(foundTagsMappedToOptions ?? []), ...createNewTagOption];

  const pickedTagsMapped = value?.map((tag) => (
    <Tag key={tag} title={tag} onRemove={() => handleRemoveTag(tag)} />
  ));

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text first-letter:capitalize">{label}</span>
      </label>
      <div
        className="input input-bordered w-full h-auto min-h-12 p-2"
        onClick={handleInputContainerClick}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {pickedTagsMapped}
          <input
            ref={inputRef}
            className="rounded-lg flex-grow"
            value={state.searchText ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
      </div>
      {state.searchText && <Dropdown open items={dropdownOptions} />}
    </div>
  );
};
