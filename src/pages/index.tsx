import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>JHU ACM</title>
        <meta
          name="description"
          content="Johns Hopkins University ACM Chapter"
        />
      </Head>
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">JHU ACM</h1>
          <p className="mt-2 text-gray-500">
            Johns Hopkins University ACM Chapter
          </p>
        </div>
      </main>
    </>
  );
}
