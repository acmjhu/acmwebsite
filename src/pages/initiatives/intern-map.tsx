import Head from "next/head";

export default function InternMapPage() {
  return (
    <>
      <Head>
        <title>InternMap - JHU ACM</title>
        <meta
          name="description"
          content="See where JHU ACM members are interning across the country and around the world."
        />
      </Head>

      <div className="bg-gray-50">
        {/* Hero */}
        <section className="bg-primary py-16 text-white">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">InternMap</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Discover where JHU ACM members are interning — from startups to
              top tech companies, coast to coast and beyond.
            </p>
          </div>
        </section>

        {/* About */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-2xl border-t-[3px] border-t-primary-mid bg-white/95 p-8 shadow-lg backdrop-blur-xl sm:p-12">
              <h2 className="mb-4 text-2xl font-bold text-primary">
                What is InternMap?
              </h2>
              <p className="text-lg leading-relaxed text-gray-700">
                InternMap is an ACM@JHU initiative that visualizes where our
                members land internships each semester. It&apos;s a way to
                celebrate our community&apos;s achievements, help underclassmen
                see what&apos;s possible, and spark conversations about
                recruiting, interview prep, and career paths.
              </p>
            </div>
          </div>
        </section>

        {/* Map placeholder */}
        <section className="py-8 pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-6 text-center text-2xl font-bold text-primary">
              Member Internship Locations
            </h2>
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white/95 shadow-lg">
              <p className="text-gray-400">Map coming soon.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
