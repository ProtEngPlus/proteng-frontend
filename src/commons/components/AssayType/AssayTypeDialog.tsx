import { useEffect, useState } from "react";
import Button from "../Button/Button";
import { AssayTypeInput } from "../../interfaces/AssayType.interface";
import { getErrorMessage } from "../../api/utils";

interface Props {
  isVisible: boolean;
  title: string;
  initial?: AssayTypeInput;
  onClose: () => void;
  onSave: (input: AssayTypeInput) => Promise<void>;
}

export default function AssayTypeDialog({
  isVisible,
  title,
  initial,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setMessage("");
    }
  }, [isVisible, initial]);

  if (!isVisible) return null;

  const handleSave = async () => {
    if (name.trim() === "") {
      setMessage("Name is required.");
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() });
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/50">
      <div
        role="dialog"
        aria-label={title}
        className="w-[460px] max-w-full space-y-5 rounded-lg border border-pep-gray-border bg-white p-6 shadow-dropShadow"
      >
        <h1 className="text-xl">{title}</h1>
        <div className="space-y-1">
          <label htmlFor="assay-type-name" className="text-sm font-light">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            id="assay-type-name"
            value={name}
            maxLength={50}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-pep-gray-border px-3 py-2 font-light focus:border-pep-blue focus:ring-pep-blue"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="assay-type-description"
            className="text-sm font-light"
          >
            Description
          </label>
          <textarea
            id="assay-type-description"
            value={description}
            maxLength={200}
            rows={3}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-lg border border-pep-gray-border px-3 py-2 font-light focus:border-pep-blue focus:ring-pep-blue"
          />
        </div>
        {message && <p className="text-sm text-error">{message}</p>}
        <div className="flex justify-end space-x-3">
          <Button
            id="assay-type-cancel"
            type="button"
            buttonType="cancel"
            text="Cancel"
            onClick={onClose}
          />
          <Button
            id="assay-type-save"
            type="button"
            buttonType="submit"
            text="Save"
            disabled={isSaving}
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
