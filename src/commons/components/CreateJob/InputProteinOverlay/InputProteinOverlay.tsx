import { Icon } from "@iconify/react/dist/iconify.js";
import { Modal } from "flowbite";
import type { ModalOptions, ModalInterface } from "flowbite";
import { useEffect, useRef } from "react";

export type InputProteinOverlayProps = {
  inputProtein: string;
  onClose: () => void;
};

export function InputProteinOverlay({
  isVisible,
  inputProteinProps,
}: {
  isVisible: boolean;
  inputProteinProps: InputProteinOverlayProps;
}) {
  const { inputProtein, onClose } = inputProteinProps;
  const sequenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const $modalElement = document.querySelector("input-protein-modal");

    let modal: ModalInterface | null = null;

    if ($modalElement instanceof HTMLElement && isVisible) {
      const modalOptions: ModalOptions = {
        placement: "bottom-right",
        backdrop: "dynamic",
        backdropClasses: "bg-gray-900/50 fixed inset-0 z-10",
        closable: true,
      };

      modal = new Modal($modalElement, modalOptions);
      modal.show();
    }

    return () => {
      if (modal) {
        modal.hide();
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const handleWheel = (event: WheelEvent) => {
        if (sequenceRef.current?.contains(event.target as Node)) return;
        event.preventDefault(); // Prevent scrolling
      };
      window.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        window.removeEventListener("wheel", handleWheel);
      };
    }
  }, [isVisible]);

  return (
    isVisible && (
      <div
        id="input-protein-modal"
        className="fixed top-0 right-0 left-0 z-[90] flex justify-center items-center w-full h-full bg-gray-900/50 mt-0"
      >
        <div className="space-y-5 place-items-center place-self-center w-[644px] place-content-center text-center">
          <div className="bg-pep-blue-light opacity-100 px-5 py-8 m-auto z-[100]">
            <Icon
              id="close-button"
              icon="streamline:delete-1-solid"
              className="size-5 text-error cursor-pointer"
              onClick={onClose}
            />
            <div className="p-5 space-y-8">
              <div className="flex place-content-center items-center space-x-3">
                <Icon
                  icon="hugeicons:dna"
                  className="size-[30px] text-pep-gray"
                />
                <label className="text-2xl text-pep-dark-gray">
                  Protein Sequence
                </label>
              </div>
              <div
                ref={sequenceRef}
                className="rounded-lg border border-pep-gray-border py-3 pl-5 pr-4 break-all text-start max-h-[50vh] overflow-y-auto overscroll-contain"
              >
                {inputProtein}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
