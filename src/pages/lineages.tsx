import { GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { prisma } from "@/lib/prisma";
import { buildLineageTrees, extractGraduationYears } from "@/lib/lineage";
import TreeSelector from "@/components/lineages/TreeSelector";
import LineageTree from "@/components/lineages/LineageTree";
import type { LineagesPageProps } from "@/types/lineage";

export const getServerSideProps: GetServerSideProps<
  LineagesPageProps
> = async () => {
  try {
    const members = await prisma.lineageMember.findMany({
      select: {
        id: true,
        name: true,
        graduationYear: true,
        role: true,
        imageUrl: true,
        mentorId: true,
        treeName: true,
      },
      orderBy: { name: "asc" },
    });

    const trees = buildLineageTrees(members);
    const graduationYears = extractGraduationYears(members);

    return {
      props: {
        trees,
        graduationYears,
      },
    };
  } catch (error) {
    console.error("Failed to fetch lineage data:", error);
    return {
      props: {
        trees: [],
        graduationYears: [],
      },
    };
  }
};

export default function LineagesPage({
  trees,
  graduationYears,
}: LineagesPageProps) {
  const [selectedTreeName, setSelectedTreeName] = useState(
    trees[0]?.name || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const selectedTree = trees.find((t) => t.name === selectedTreeName);

  return (
    <>
      <Head>
        <title>Lineages | JHU ACM</title>
        <meta
          name="description"
          content="Explore ACM@JHU family trees and mentorship lineages"
        />
      </Head>
      <main className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <section className="bg-primary text-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h1 className="text-4xl font-bold">Lineages</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              ACM@JHU has a tradition of mentorship lineages &mdash; family
              trees that connect members across generations. Explore the trees
              below to see how our community is connected.
            </p>
          </div>
        </section>

        {/* Controls + Tree */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          {trees.length > 0 ? (
            <>
              <TreeSelector
                treeNames={trees.map((t) => t.name)}
                selectedTree={selectedTreeName}
                onTreeChange={setSelectedTreeName}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                graduationYears={graduationYears}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
              />

              {selectedTree ? (
                <LineageTree
                  data={selectedTree.data}
                  searchQuery={searchQuery}
                  selectedYear={selectedYear}
                />
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
                  Select a family tree to view.
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
              No lineage data available yet.
            </div>
          )}
        </section>
      </main>
    </>
  );
}
