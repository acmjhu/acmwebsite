import type { LineageMemberRecord, LineageTreeNode } from "@/types/lineage";

function toNode(
  member: LineageMemberRecord,
  childrenMap: Map<string, LineageMemberRecord[]>
): LineageTreeNode {
  const node: LineageTreeNode = {
    name: member.name,
    attributes: {
      id: member.id,
      ...(member.graduationYear
        ? { graduationYear: String(member.graduationYear) }
        : {}),
      ...(member.role ? { role: member.role } : {}),
      ...(member.imageUrl ? { imageUrl: member.imageUrl } : {}),
    },
  };
  const kids = childrenMap.get(member.id);
  if (kids && kids.length > 0) {
    node.children = kids.map((k) => toNode(k, childrenMap));
  }
  return node;
}

export function buildLineageTrees(
  members: LineageMemberRecord[]
): { name: string; data: LineageTreeNode }[] {
  const grouped = new Map<string, LineageMemberRecord[]>();
  for (const member of members) {
    const key = member.treeName || "Unnamed Tree";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(member);
  }

  const trees: { name: string; data: LineageTreeNode }[] = [];

  for (const [treeName, group] of grouped) {
    const byId = new Map<string, LineageMemberRecord>();
    for (const m of group) byId.set(m.id, m);

    const childrenMap = new Map<string, LineageMemberRecord[]>();
    const roots: LineageMemberRecord[] = [];

    for (const m of group) {
      if (m.mentorId && byId.has(m.mentorId)) {
        if (!childrenMap.has(m.mentorId)) childrenMap.set(m.mentorId, []);
        childrenMap.get(m.mentorId)!.push(m);
      } else {
        roots.push(m);
      }
    }

    if (roots.length === 1) {
      trees.push({ name: treeName, data: toNode(roots[0], childrenMap) });
    } else if (roots.length > 1) {
      trees.push({
        name: treeName,
        data: {
          name: treeName,
          attributes: { id: "virtual-root" },
          children: roots.map((r) => toNode(r, childrenMap)),
        },
      });
    }
  }

  trees.sort((a, b) => a.name.localeCompare(b.name));
  return trees;
}
