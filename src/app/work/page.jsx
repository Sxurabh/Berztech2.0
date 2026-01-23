import Link from "next/link";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import Container from "@/components/Container";
import FadeIn from "@/components/FadeIn";
import Blockquote from "@/components/Blockquote";

// Images for the case studies
import laptop from "@/images/laptop.jpg";
import meeting from "@/images/meeting.jpg";
import whiteboard from "@/images/whiteboard.jpg";

// Logos for the case study details
import logoFamilyFund from "@/images/clients/family-fund/logomark-dark.svg";
import logoUnseal from "@/images/clients/unseal/logomark-dark.svg";
import logoPhobia from "@/images/clients/phobia/logomark-dark.svg";

const caseStudies = [
  {
    client: "Family Fund",
    clientLogo: logoFamilyFund,
    title: "Skip the bank, borrow from those you trust",
    description:
      "Family Fund is a crowdfunding platform for friends and family. Allowing users to take personal loans from their network without a traditional financial institution.",
    summary: [
      "Family Fund is a crowdfunding platform for friends and family. Allowing users to take personal loans from their network without a traditional financial institution.",
      "We developed a custom CMS to power their blog with checkout functionality to allow their users to purchase the producst they love.",
    ],
    logo: logoFamilyFund,
    image: laptop,
    service: "Web development, CMS",
    date: "January 2023",
    url: "/work/family-fund",
  },
  {
    client: "Unseal",
    clientLogo: logoUnseal,
    title: "Get a double-check on your SSL certificates",
    description:
      "Unseal is the first NFT platform where users can mint and trade NFTs of their own personal health records, allowing them to take control of their data.",
    summary: [
      "Unseal is the first NFT platform where users can mint and trade NFTs of their own personal health records, allowing them to take control of their data.",
      "We built a custom blockchain explorer to allow their users to verify the transactions and view the metadata of the NFTs.",
    ],
    logo: logoUnseal,
    image: meeting,
    service: "Blockchain, Web development",
    date: "October 2022",
    url: "/work/unseal",
  },
  {
    client: "Phobia",
    clientLogo: logoPhobia,
    title: "Overcome your fears, find your match",
    description:
      "Phobia is a dating app that matches users based on their mutual phobias so they can be scared together.",
    summary: [
      "Phobia is a dating app that matches users based on their mutual phobias so they can be scared together.",
      "We worked with Phobia to develop a custom onboarding flow that allows users to select their phobias and find their perfect match.",
    ],
    logo: logoPhobia,
    image: whiteboard,
    service: "App development, UX design",
    date: "June 2022",
    url: "/work/phobia",
  },
];

function CaseStudies({ caseStudies }) {
  return (
    <Container className="mt-40">
      <FadeIn>
        <h2 className="font-display text-2xl font-semibold text-neutral-950">
          Case studies
        </h2>
      </FadeIn>
      <div className="mt-10 space-y-20 sm:space-y-24 lg:space-y-32">
        {caseStudies.map((caseStudy) => (
          <FadeIn key={caseStudy.client}>
            <article>
              <div className="grid grid-cols-3 gap-x-8 gap-y-8 pt-16 relative before:absolute before:inset-0 before:top-0 before:h-px before:bg-neutral-950/10 lg:grid-cols-4">
                <div className="col-span-full lg:col-span-2 lg:max-w-2xl">
                  <div className="font-display text-4xl font-medium text-neutral-950">
                    <Link href={caseStudy.url}>{caseStudy.title}</Link>
                  </div>
                  <div className="mt-6 space-y-6 text-base text-neutral-600">
                    {caseStudy.summary.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="mt-8 flex border-t border-neutral-950/10 pt-8">
                    <Link
                      href={caseStudy.url}
                      className="text-sm font-semibold text-neutral-950 transition hover:text-neutral-700"
                      aria-label={`Read case study: ${caseStudy.client}`}
                    >
                      Read case study <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
                <div className="col-span-full lg:col-span-2 lg:max-w-2xl">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-neutral-100 ring-1 ring-neutral-950/10">
                    <Image
                      src={caseStudy.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </Container>
  );
}

export default function Work() {
  return (
    <>
      <PageIntro
        eyebrow="Our work"
        title="Proven solutions for real-world problems."
      >
        <p>
          We believe in efficiency and maximizing our resources to provide the
          best value to our clients. The primary way we do that is by re-using
          the same five projects we’ve been developing for the past decade.
        </p>
      </PageIntro>

      <CaseStudies caseStudies={caseStudies} />

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          <Blockquote
            author={{ name: "Debra Fiscal", role: "CEO of Unseal" }}
            className="mt-6"
          >
            The team at Berztech delivered a blockchain solution that not only
            met our technical requirements but also enhanced our user experience
            significantly.
          </Blockquote>
        </FadeIn>
      </Container>
    </>
  );
}