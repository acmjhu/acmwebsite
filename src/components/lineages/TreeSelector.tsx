interface TreeSelectorProps {
  treeNames: string[];
  selectedTree: string;
  onTreeChange: (name: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  graduationYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}

export default function TreeSelector({
  treeNames,
  selectedTree,
  onTreeChange,
  searchQuery,
  onSearchChange,
  graduationYears,
  selectedYear,
  onYearChange,
}: TreeSelectorProps) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Tree selector */}
        {treeNames.length > 1 && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="tree-select"
              className="text-xs font-medium uppercase tracking-wide text-gray-400"
            >
              Family Tree
            </label>
            <select
              id="tree-select"
              value={selectedTree}
              onChange={(e) => onTreeChange(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {treeNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search */}
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="member-search"
            className="text-xs font-medium uppercase tracking-wide text-gray-400"
          >
            Search
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              id="member-search"
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-56"
            />
          </div>
        </div>

        {/* Year filter */}
        {graduationYears.length > 0 && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="year-filter"
              className="text-xs font-medium uppercase tracking-wide text-gray-400"
            >
              Graduation Year
            </label>
            <select
              id="year-filter"
              value={selectedYear ?? ""}
              onChange={(e) =>
                onYearChange(e.target.value ? Number(e.target.value) : null)
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Years</option>
              {graduationYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
