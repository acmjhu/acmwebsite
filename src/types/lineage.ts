export interface LineageMemberRecord {
  id: string;
  name: string;
  graduationYear: number | null;
  role: string | null;
  imageUrl: string | null;
  mentorId: string | null;
  treeName: string | null;
}

export interface LineageTreeNode {
  name: string;
  attributes?: {
    id: string;
    graduationYear?: string;
    role?: string;
    imageUrl?: string;
  };
  children?: LineageTreeNode[];
}

export interface LineagesPageProps {
  trees: {
    name: string;
    data: LineageTreeNode;
  }[];
}
