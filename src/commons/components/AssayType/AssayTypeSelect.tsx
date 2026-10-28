import { useEffect, useState } from "react";
import { createAssayType, getAllAssayTypes } from "../../api/assayType";
import { AssayTypeSummary } from "../../interfaces/AssayType.interface";
import AssayTypeDialog from "./AssayTypeDialog";

const createValue = "__create__";

interface Props {
  id: string;
  value: string;
  onChange: (assayTypeId: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export default function AssayTypeSelect({
  id,
  value,
  onChange,
  disabled = false,
  hasError = false,
}: Props) {
  const [types, setTypes] = useState<AssayTypeSummary[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    getAllAssayTypes().then(setTypes).catch(console.error);
  }, []);

  return (
    <>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          if (event.target.value === createValue) {
            setIsCreating(true);
          } else {
            onChange(event.target.value);
          }
        }}
        className={`w-full rounded-lg border px-3 py-2 font-light focus:border-pep-blue focus:ring-pep-blue disabled:cursor-not-allowed disabled:bg-gray-50 ${
          hasError ? "border-error" : "border-pep-gray-border"
        }`}
      >
        <option value="">Select assay score type</option>
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name} ({type.job_count} jobs, {type.result_count} results)
          </option>
        ))}
        <option value={createValue}>+ Create new type</option>
      </select>
      <AssayTypeDialog
        isVisible={isCreating}
        title="Create assay score type"
        onClose={() => setIsCreating(false)}
        onSave={async (input) => {
          const created = await createAssayType(input);
          setTypes((previous) => [
            ...previous,
            { ...created, job_count: 0, result_count: 0 },
          ]);
          onChange(created.id);
          setIsCreating(false);
        }}
      />
    </>
  );
}
