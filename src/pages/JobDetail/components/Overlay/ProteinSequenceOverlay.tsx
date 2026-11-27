import { Icon } from "@iconify/react";
import { useState } from "react";

export type ProteinSequenceProps = {
  onClose: () => void;
};

export function ProteinSequenceOverlay({
  isVisible,
  proteinSequenceProps,
  proteinSequence,
  mutationPositions,
}: {
  isVisible: boolean;
  proteinSequenceProps: ProteinSequenceProps;
  proteinSequence: string;
  mutationPositions: string[];
}) {
  const { onClose } = proteinSequenceProps;
  const [currentMutationPosition, setCurrentMutationPosition] = useState<
    number | null
  >(null);

  const allMutationPositions = mutationPositions.map((position) =>
    parseInt(position.replace(/\D/g, ""), 10),
  );

  return (
    isVisible && (
      <div
        id="#protein-sequence-modal"
        className="fixed top-0 right-0 left-0 z-[90] flex justify-center items-center w-full h-full bg-gray-900/50 mt-0"
      >
        <div className="space-y-5 place-items-center place-self-center w-[55%] place-content-center font-normal">
          <div className="bg-pep-blue-light opacity-100 px-5 py-8 m-auto z-[100] space-y-8 rounded-lg">
            <div className="items-start">
              <Icon
                icon="streamline:delete-1-solid"
                className="text-error size-5 self-center cursor-pointer"
                onClick={onClose}
              />
            </div>
            <div className="flex space-x-3 place-self-center items-center">
              <Icon
                icon="hugeicons:dna"
                className="text-gray-400"
                width="30"
                height="30"
              />
              <span className="text-2xl text-pep-dark-gray font-normal">
                Protein Sequence
              </span>
            </div>

            <div className="bg-white rounded-lg p-8 gap-x-3 gap-y-4 mx-6">
              <div className="space-y-4 flex flex-col items-center">
                {mutationPositions.length > 0 && (
                  <div className="cursor-pointer text-gray-500">
                    {"["}
                    {mutationPositions.map((position, index) => (
                      <div key={"position_" + index} className="inline">
                        <span
                          className="text-pep-orange cursor-pointer hover:text-pep-blue"
                          onMouseEnter={() =>
                            setCurrentMutationPosition(
                              parseInt(position.replace(/\D/g, ""), 10),
                            )
                          }
                          onMouseLeave={() => setCurrentMutationPosition(null)}
                        >
                          {position}
                        </span>
                        <span>
                          {index < mutationPositions.length - 1 ? ", " : ""}
                        </span>
                      </div>
                    ))}
                    {"]"}
                  </div>
                )}
                <div className="items-left w-[90%] border border-pep-gray-border rounded-lg p-4 break-all leading-7 tracking-wide max-h-[50vh] overflow-y-auto overscroll-contain">
                  {proteinSequence.split("").map((char, index) => (
                    <span
                      key={"prot+" + index}
                      className={
                        index + 1 === currentMutationPosition
                          ? "text-pep-blue"
                          : allMutationPositions.includes(index + 1)
                            ? "text-pep-orange"
                            : ""
                      }
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
