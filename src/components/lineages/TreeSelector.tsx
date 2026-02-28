interface TreeSelectorProps {
  treeNames: string[];
  selectedTree: string;
  onTreeChange: (name: string) => void;
}

export default function TreeSelector({
  treeNames,
  selectedTree,
  onTreeChange,
}: TreeSelectorProps) {
  if (treeNames.length <= 1) return null;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
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
    </div>
  );
}
