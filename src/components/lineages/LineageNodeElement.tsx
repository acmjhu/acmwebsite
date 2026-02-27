import type { CustomNodeElementProps } from "react-d3-tree";

export default function LineageNodeElement({
  nodeDatum,
  toggleNode,
}: CustomNodeElementProps) {
  const attrs = nodeDatum.attributes as
    | Record<string, string | number | boolean>
    | undefined;
  const graduationYear = attrs?.graduationYear as string | undefined;
  const role = attrs?.role as string | undefined;
  const imageUrl = attrs?.imageUrl as string | undefined;
  const isVirtualRoot = attrs?.id === "virtual-root";
  const isHighlighted = attrs?.__highlighted === true;
  const isSearchActive = attrs?.__searchActive === true;

  const nodeWidth = 180;
  const hasImage = !!imageUrl;
  const nodeHeight = hasImage ? 140 : 80;

  const dimOpacity = isSearchActive && !isHighlighted ? 0.3 : 1;

  return (
    <g onClick={toggleNode} style={{ cursor: "pointer", opacity: dimOpacity }}>
      {/* Highlight ring */}
      {isHighlighted && (
        <rect
          x={-nodeWidth / 2 - 3}
          y={-nodeHeight / 2 - 3}
          width={nodeWidth + 6}
          height={nodeHeight + 6}
          rx={10}
          fill="none"
          stroke="#10b981"
          strokeWidth={3}
        />
      )}

      {/* Card background */}
      <rect
        x={-nodeWidth / 2}
        y={-nodeHeight / 2}
        width={nodeWidth}
        height={nodeHeight}
        rx={8}
        fill={isVirtualRoot ? "#003566" : "white"}
        stroke={isVirtualRoot ? "#003566" : "#001d3d"}
        strokeWidth={isVirtualRoot ? 0 : 1.5}
      />

      {/* Photo */}
      {hasImage && (
        <foreignObject x={-20} y={-nodeHeight / 2 + 8} width={40} height={40}>
          <img
            src={imageUrl}
            alt={String(nodeDatum.name)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        </foreignObject>
      )}

      {/* Name */}
      <text
        textAnchor="middle"
        y={hasImage ? 18 : -8}
        style={{
          fontSize: "13px",
          fontWeight: 600,
          fill: isVirtualRoot ? "white" : "#001d3d",
          fontFamily: "var(--font-dm-sans), sans-serif",
        }}
      >
        {nodeDatum.name}
      </text>

      {/* Graduation year */}
      {graduationYear && (
        <text
          textAnchor="middle"
          y={hasImage ? 34 : 8}
          style={{
            fontSize: "11px",
            fill: isVirtualRoot ? "rgba(255,255,255,0.8)" : "#666",
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}
        >
          Class of {graduationYear}
        </text>
      )}

      {/* Role */}
      {role && (
        <text
          textAnchor="middle"
          y={hasImage ? 50 : 24}
          style={{
            fontSize: "11px",
            fill: isVirtualRoot ? "rgba(255,255,255,0.8)" : "#003566",
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}
        >
          {role}
        </text>
      )}
    </g>
  );
}
