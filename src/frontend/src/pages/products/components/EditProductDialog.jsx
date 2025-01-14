import { Dialog, DialogActions, DialogTitle } from "../../../components/Dialog";
import { TextInput } from "../../../components/TextInput";
import { Button } from "../../../components/Button";
import { useState } from "react";
import { Select } from "../../../components/Select";
import { Textarea } from "../../../components/Textarea";
import { TagsInput } from "../../../components/TagsInput";
import { useUploadProductImageMutation } from "../../../api/useUploadProductImage";

export const ProductDialog = ({
  isOpen,
  onClose,
  companies,
  defaultValues,
  title,
  submitText,
  onSubmit,
  isPending,
}) => {
  const [formData, setFormData] = useState({
    title: defaultValues?.title ?? "",
    companyId: defaultValues?.companyId ?? "",
    tags: defaultValues?.tags.map((tag) => tag.name) ?? [],
    description: defaultValues?.description ?? "",
    image: null,
  });
  const [errors, setErrors] = useState({});

  const {
    mutateAsync: uploadProductImage,
    isPending: isUploadProductImagePending,
  } = useUploadProductImageMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTagsChange = (tags) => setFormData((prev) => ({ ...prev, tags }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title) newErrors.title = "Název produktu je povinný.";
    if (!formData.companyId) newErrors.companyId = "Vyberte společnost.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onSubmit(
      {
        title: formData.title,
        description: formData.description,
        companyId: +formData.companyId,
        tags: formData.tags,
      },
      async (productId) => {
        if (formData.image)
          uploadProductImage({ file: formData.image, productId });
      },
    );
  };

  return (
    <Dialog isOpen={isOpen}>
      <DialogTitle>{title}</DialogTitle>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <TextInput
          className="form-control"
          label="Název Produktu"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.name}
        />
        <TagsInput
          label="Tagy"
          name="tagId"
          value={formData.tags}
          onChange={handleTagsChange}
        />
        <Select
          label="Společnost"
          name="companyId"
          value={formData.companyId}
          onChange={handleChange}
          options={companies.map((company) => ({
            id: company.id,
            name: company.name,
          }))}
          error={errors.companyId}
        />
        <Textarea
          label="Popis"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        <label className="pt-4 text-sm">Obrázek</label>
        <input
          className="pt-2"
          type="file"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, image: e.target.files[0] }))
          }
        />
        <DialogActions>
          <Button variant="basic" onClick={onClose}>
            Zrušit
          </Button>
          <Button
            type="submit"
            isLoading={isPending || isUploadProductImagePending}
          >
            {submitText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
