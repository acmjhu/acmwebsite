import Head from "next/head";

const process = [
  { step: "1", label: "Apply", detail: "Submit an application at the start of the semester." },
  { step: "2", label: "Interview", detail: "Have a brief interview with the project leads." },
  { step: "3", label: "Build", detail: "Get selected, join the team, and meet weekly to ship." },
];

const tracks = [
  {
    title: "Underclassmen Projects",
    description:
      "Small teams of underclassmen work on open-source projects, many of which are built and maintained by ACM board members. Teams meet weekly throughout the semester to make real, meaningful contributions to a shared codebase.",
  },
  {
    title: "Flagship Project",
    description:
      "Each semester, one larger and more complex project is offered for students ready for a serious challenge. The scope is bigger, the work is harder, and the experience is closer to what you would find in a real software engineering role.",
  },
];

export default function CodingCirclesPage() {
  return (
    <>
      <Head>
        <title>Coding Circles - JHU ACM</title>
        <meta
          name="description"
          content="Coding Circles is an ACM@JHU initiative where students contribute to open-source projects, meeting weekly to build real software under the guidance of ACM board members."
        />
      </Head>

      <div className="bg-gray-50">
        {/* Hero */}
        <section className="bg-primary py-16 text-white">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">Coding Circles</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Real open-source projects. Weekly collaboration. Practical experience.
            </p>
          </div>
        </section>

        {/* About */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-2xl border-t-[3px] border-t-primary-mid bg-white/95 p-8 shadow-lg backdrop-blur-xl sm:p-12">
              <h2 className="mb-4 text-2xl font-bold text-primary">
                What are Coding Circles?
              </h2>
              <p className="text-lg leading-relaxed text-gray-700">
                Coding Circles gives underclassmen a place to build real
                software and grow as developers. By the end of the semester,
                you will have contributed to an actual open-source codebase,
                worked within a team, and gained the kind of practical
                experience that coursework alone does not provide.
              </p>
            </div>
          </div>
        </section>

        {/* Tracks */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-center text-2xl font-bold text-primary">
              Projects
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {tracks.map((track) => (
                <div
                  key={track.title}
                  className="rounded-2xl bg-white/95 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <h3 className="text-lg font-bold text-primary">{track.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{track.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-center text-2xl font-bold text-primary">
              The Process
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {process.map(({ step, label, detail }) => (
                <div key={step} className="rounded-2xl bg-white/95 p-6 text-center shadow-lg backdrop-blur-xl">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {step}
                  </div>
                  <h3 className="text-lg font-bold text-primary">{label}</h3>
                  <p className="mt-1 text-sm text-gray-600">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-2xl border-t-[3px] border-t-primary-mid bg-white/95 p-8 text-center shadow-lg backdrop-blur-xl sm:p-12">
              <h2 className="mb-4 text-2xl font-bold text-primary">
                Get Involved
              </h2>
              <p className="mx-auto max-w-xl text-gray-700">
                Coding Circles run each semester. Applications open at the start
                of the term. Keep an eye on our events page for announcements.
              </p>
              <a
                href="/events"
                className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-mid"
              >
                View Events
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
