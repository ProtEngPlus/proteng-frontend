import { MutationResultInterface } from "../../../../commons/interfaces/Mutation.interface";
import { Icon } from "@iconify/react/dist/iconify.js";
import { updateMutationResultDetail } from "../../../../commons/api/mutation";
import Pagination from "../../../../commons/components/Pagination/Pagination";

const headers = ["Protein Sequence", "Assay Score"];

export default function MutationResultTable({
  mutationResults,
  refresh,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  setIsProteinSequenceVisible,
  setCurrentMutationResult,
}: {
  mutationResults: MutationResultInterface[];
  refresh: () => void;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  setIsProteinSequenceVisible: (isVisible: boolean) => void;
  setCurrentMutationResult: (mutationResult: MutationResultInterface) => void;
}) {
  const handleBookmark = async (mutationResult: MutationResultInterface) => {
    await updateMutationResultDetail(mutationResult.id, {
      is_bookmark: !mutationResult.is_bookmark,
    });
    refresh();
  };

  const handleViewSequence = (mutationResult: MutationResultInterface) => {
    setIsProteinSequenceVisible(true);
    setCurrentMutationResult(mutationResult);
  };

  //for pagination
  const totalPages = Math.ceil(mutationResults.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMutationResults = mutationResults.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div>
      {mutationResults.length == 0 ? (
        <div className="text-center">
          <div className="text-label text-xl">No mutation result was found</div>
          <div className="font-light text-pep-gray">
            Change the filter or create new mutation collection
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* MutationResult Table */}
          <div className="relative overflow-auto rounded-xl border border-[#DFE4EA] shadow-table">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="leading-6 bg-blue-50 text-left border-b h-[60px]">
                <tr>
                  <th
                    scope="col"
                    className="font-normal px-6 py-3 text-base"
                  ></th>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="font-normal px-3 py-3 text-base"
                    >
                      {header}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="font-normal px-6 py-3 text-base"
                  ></th>
                </tr>
              </thead>
              <tbody className="font-light leading-7">
                {currentMutationResults.map((mutationResult) => (
                  <tr
                    key={mutationResult.id}
                    className="font-light bg-white border-b h-[60px]"
                  >
                    <td className="pl-3 py-3 place-items-center">
                      <Icon
                        icon="cil:bookmark"
                        className={`${mutationResult.is_bookmark ? "text-pep-orange" : "text-pep-gray"}  text-xl cursor-pointer`}
                        onClick={() => {
                          handleBookmark(mutationResult);
                        }}
                      />
                    </td>
                    <td className="px-3 py-3 text-left truncate overflow-hidden max-w-[420px]">
                      {mutationResult.mutation_positions.join(", ")}
                    </td>
                    <td className="px-3 py-3 text-left">
                      {mutationResult.assay_score}
                    </td>
                    <td className="pl-3 pr-12 py-3 place-items-center text-pep-blue">
                      <div
                        className="flex gap-1 underline items-center cursor-pointer"
                        onClick={() => handleViewSequence(mutationResult)}
                      >
                        View Sequence
                        <Icon
                          icon="iconamoon:eye-thin"
                          width="20"
                          height="20"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
