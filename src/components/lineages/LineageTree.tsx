import { useRef, useCallback, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { RawNodeDatum } from "react-d3-tree";
import LineageNodeElement from "./LineageNodeElement";
import type { LineageTreeNode } from "@/types/lineage";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

interface LineageTreeProps {
  data: LineageTreeNode;
  searchQuery: string;
  selectedYear: number | null;
}

function markHighlights(
  node: LineageTreeNode,
  searchQuery: string,
  selectedYear: number | null,
  searchActive: boolean
): RawNodeDatum {
  const nameMatch =
    searchQuery.length > 0 &&
    node.name.toLowerCase().includes(searchQuery.toLowerCase());
  const yearMatch =
    selectedYear !== null &&
    node.attributes?.graduationYear === String(selectedYear);
  const highlighted = nameMatch || yearMatch;

  const result: RawNodeDatum = {
    name: node.name,
    attributes: {
      ...node.attributes,
      __highlighted: highlighted,
      __searchActive: searchActive,
    } as Record<string, string | number | boolean>,
  };

  if (node.children && node.children.length > 0) {
    result.children = node.children.map((child) =>
      markHighlights(child, searchQuery, selectedYear, searchActive)
    );
  }

  return result;
}

export default function LineageTree({
  data,
  searchQuery,
  selectedYear,
}: LineageTreeProps) {
  const [translate, setTranslate] = useState({ x: 400, y: 60 });
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [initialZoom, setInitialZoom] = useState(0.85);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const rect = node.getBoundingClientRect();
      setTranslate({ x: rect.width / 2, y: 60 });
      setDimensions({ width: rect.width, height: rect.height });
      setInitialZoom(rect.width < 640 ? 0.55 : 0.85);
    }
  }, []);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      containerRef(node);
      if (node) {
        resizeObserverRef.current = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            setTranslate({ x: width / 2, y: 60 });
            setDimensions({ width, height });
          }
        });
        resizeObserverRef.current.observe(node);
      }
    },
    [containerRef]
  );

  const searchActive = searchQuery.trim().length > 0 || selectedYear !== null;

  const treeData = useMemo(
    () => markHighlights(data, searchQuery.trim(), selectedYear, searchActive),
    [data, searchQuery, selectedYear, searchActive]
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      {/* Dot grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#fafbfc",
          backgroundImage:
            "radial-gradient(circle, #d1d5db 0.75px, transparent 0.75px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Tree */}
      <div ref={setContainerRef} className="relative h-[600px] w-full">
        <Tree
          data={treeData}
          orientation="vertical"
          translate={translate}
          dimensions={dimensions ?? undefined}
          zoom={initialZoom}
          scaleExtent={{ min: 0.3, max: 1.5 }}
          nodeSize={{ x: 210, y: 100 }}
          renderCustomNodeElement={(props) => <LineageNodeElement {...props} />}
          pathFunc="step"
          pathClassFunc={() => "lineage-link"}
          separation={{ siblings: 1.2, nonSiblings: 1.5 }}
          collapsible
          dataKey={data.name}
        />
      </div>
      {/* Helper hint */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs text-gray-400 shadow-sm backdrop-blur-sm">
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
        Drag to pan &middot; Scroll to zoom &middot; Click to collapse
      </div>
      {/* Global styles for tree links */}
      <style jsx global>{`
        .lineage-link {
          stroke: #cbd5e1 !important;
          stroke-width: 1.5 !important;
        }
      `}</style>
    </div>
  );
}
