import { useTagsQuery } from "../../../api/useTagsQuery";
import { DynamicContent } from "../../../components/DynamicContent";
import { Tag } from "../../../components/Tag";

export const TagsPicker = ({ selected, onChange }) => {
  const query = useTagsQuery({ limit: 1_000 });

  const renderContent = ({ results }) => {
    const mappedTags = results.map((tag) => {
      const isSelected = selected.includes(tag.id);

      const handleClick = () => {
        const newSelected = selected.includes(tag.id)
          ? selected.filter((selectedId) => selectedId !== tag.id)
          : [...selected, tag.id];

        onChange(newSelected);
      };
      return (
        <Tag
          key={tag.id}
          title={tag.name}
          isActive={isSelected}
          onClick={handleClick}
        />
      );
    });

    return <div className="flex gap-2 flex-wrap">{mappedTags}</div>;
  };

  return <DynamicContent {...query} renderContent={renderContent} />;
};
