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

  const nodeWidth = 172;
  const nodeHeight = 72;
  const dimOpacity = isSearchActive && !isHighlighted ? 0.25 : 1;

  if (isVirtualRoot) {
    return (
      <g onClick={toggleNode} style={{ cursor: "pointer" }}>
        <circle r={6} fill="#003566" />
      </g>
    );
  }

  const nodeId = (attrs?.id as string) || "node";

  return (
    <g onClick={toggleNode} style={{ cursor: "pointer", opacity: dimOpacity }}>
      <defs>
        <clipPath id={`clip-${nodeId}`}>
          <rect
            x={-nodeWidth / 2}
            y={-nodeHeight / 2}
            width={nodeWidth}
            height={nodeHeight}
            rx={12}
          />
        </clipPath>
      </defs>
      {/* Shadow */}
      <rect
        x={-nodeWidth / 2 + 2}
        y={-nodeHeight / 2 + 2}
        width={nodeWidth}
        height={nodeHeight}
        rx={12}
        fill="rgba(0,0,0,0.05)"
      />
      {/* Card */}
      <rect
        x={-nodeWidth / 2}
        y={-nodeHeight / 2}
        width={nodeWidth}
        height={nodeHeight}
        rx={12}
        fill="white"
        stroke={isHighlighted ? "#10b981" : "#e5e7eb"}
        strokeWidth={isHighlighted ? 2 : 1}
      />
      {/* Left accent bar (clipped to card shape) */}
      <rect
        x={-nodeWidth / 2}
        y={-nodeHeight / 2}
        width={4}
        height={nodeHeight}
        fill={role ? "#003566" : "#cbd5e1"}
        clipPath={`url(#clip-${nodeId})`}
      />

      {/* Content via foreignObject for proper HTML rendering */}
      <foreignObject
        x={-nodeWidth / 2 + 10}
        y={-nodeHeight / 2 + 4}
        width={nodeWidth - 20}
        height={nodeHeight - 8}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            height: "100%",
            fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          }}
        >
          {/* Avatar / photo */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={String(nodeDatum.name)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #001d3d 0%, #003566 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {nodeDatum.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}

          {/* Text content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {nodeDatum.name}
            </div>
            {graduationYear && (
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  lineHeight: 1.3,
                }}
              >
                Class of {graduationYear}
              </div>
            )}
            {role && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#003566",
                  lineHeight: 1.3,
                  marginTop: 1,
                }}
              >
                {role}
              </div>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}
