import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "./Button";
import { useState } from "react";
import {
  InputProteinOverlay,
  InputProteinOverlayProps,
} from "../CreateJob/InputProteinOverlay/InputProteinOverlay";

export default function ViewButton({
  inputProtein,
  disable,
  loading = false,
  resolveProtein,
}: {
  inputProtein: string;
  disable?: boolean;
  loading?: boolean;
  resolveProtein?: () => Promise<string | null>;
}) {
  // input protein overlay
  const [isProteinVisible, setProteinVisible] = useState(false);
  const [resolvedProtein, setResolvedProtein] = useState("");

  const InputProteinProps: InputProteinOverlayProps = {
    inputProtein: resolveProtein ? resolvedProtein : inputProtein,
    onClose: () => {
      setProteinVisible(false);
    },
  };

  const openProtein = async () => {
    if (!resolveProtein) {
      setProteinVisible(true);
      return;
    }

    const protein = await resolveProtein();
    if (protein) {
      setResolvedProtein(protein);
      setProteinVisible(true);
    }
  };

  return (
    <div>
      <InputProteinOverlay
        isVisible={isProteinVisible}
        inputProteinProps={InputProteinProps}
      />

      <Button
        disabled={disable}
        id="btn-view-protein"
        buttonType="cancel"
        type="button"
        text={loading ? "Loading..." : "View"}
        className="w-fit px-3 py-2 font-normal inline-flex items-center whitespace-nowrap place-content-center text-center gap-3 text-pep-dark-gray disabled:text-label disabled:cursor-default"
        onClick={openProtein}
      >
        <Icon icon="carbon:view" className="size-[30px] text-label" />
      </Button>
    </div>
  );
}
