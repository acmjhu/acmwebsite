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
  const [translate, setTranslate] = useState({ x: 400, y: 50 });
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const rect = node.getBoundingClientRect();
      setTranslate({ x: rect.width / 2, y: 50 });
      setDimensions({ width: rect.width, height: rect.height });
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
            setTranslate({ x: width / 2, y: 50 });
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
    <div
      ref={setContainerRef}
      className="h-[600px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
    >
      <Tree
        data={treeData}
        orientation="vertical"
        translate={translate}
        dimensions={dimensions ?? undefined}
        nodeSize={{ x: 220, y: 140 }}
        renderCustomNodeElement={(props) => <LineageNodeElement {...props} />}
        pathFunc="step"
        separation={{ siblings: 1.2, nonSiblings: 1.5 }}
        collapsible
        dataKey={data.name}
      />
    </div>
  );
}
