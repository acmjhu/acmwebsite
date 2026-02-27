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
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Tree selector */}
      {treeNames.length > 1 && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="tree-select"
            className="text-sm font-medium text-gray-700"
          >
            Family Tree
          </label>
          <select
            id="tree-select"
            value={selectedTree}
            onChange={(e) => onTreeChange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
      <div className="flex items-center gap-2">
        <label
          htmlFor="member-search"
          className="text-sm font-medium text-gray-700"
        >
          Search
        </label>
        <input
          id="member-search"
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Year filter */}
      {graduationYears.length > 0 && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="year-filter"
            className="text-sm font-medium text-gray-700"
          >
            Year
          </label>
          <select
            id="year-filter"
            value={selectedYear ?? ""}
            onChange={(e) =>
              onYearChange(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
  );
}
