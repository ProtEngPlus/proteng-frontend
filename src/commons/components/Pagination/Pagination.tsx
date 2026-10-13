export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}) {
  const arrowClass =
    "flex items-center justify-center size-[35px] text-label border border-pep-gray-border transition-colors duration-150 rounded-full focus:border-none focus:text-white focus:bg-pep-gray hover:bg-pep-light-gray disabled:cursor-not-allowed";

  return (
    <nav className="px-3 py-2 w-fit rounded-[45px] bg-white">
      <ul className="flex items-center space-x-2 h-8 text-sm">
        <li>
          <button
            type="button"
            aria-label="Previous page"
            className={arrowClass}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <svg
              className="w-3.5 h-3.5 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M13 5H1m0 0 4 4M1 5l4-4"
              />
            </svg>
          </button>
        </li>
        {[...Array(totalPages)].map((_, index) => (
          <li key={index}>
            <button
              className={`size-[35px] text-pep-dark-gray border border-pep-gray-border transition-colors duration-150 rounded-full focus:border-none focus:text-white focus:bg-pep-gray ${
                currentPage === index + 1
                  ? "bg-pep-gray border-none text-white"
                  : "hover:bg-pep-light-gray"
              }`}
              onClick={() => setCurrentPage(index + 1)}
              type="button"
            >
              {index + 1}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            aria-label="Next page"
            className={arrowClass}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <svg
              className="w-3.5 h-3.5 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
}
