import Image from "next/image";

interface OfficerCardProps {
  name: string;
  role: string;
  bio?: string | null;
  imageUrl?: string | null;
  linkedin?: string | null;
}

export default function OfficerCard({
  name,
  role,
  bio,
  imageUrl,
  linkedin,
}: OfficerCardProps) {
  return (
    <div className="group [perspective:1000px]">
      <div className="relative h-80 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/95 p-6 shadow-lg backdrop-blur-xl [backface-visibility:hidden]">
          <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full bg-primary-light">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary/40">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-primary">{name}</h3>
          <p className="text-sm text-gray-500">{role}</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-primary p-6 text-white shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {bio ? (
            <p className="mb-4 text-center text-sm leading-relaxed">{bio}</p>
          ) : (
            <p className="mb-4 text-center text-sm italic text-white/60">
              No bio available
            </p>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/30"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
