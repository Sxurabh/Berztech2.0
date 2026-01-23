import Link from "next/link";
import Image from "next/image";

import Blockquote from "@/components/Blockquote";
import ContactSection from "@/components/ContactSection";
import Container from "@/components/Container";
import FadeIn from "@/components/FadeIn";
import { GridList, GridListItem } from "@/components/GridList";
import PageIntro from "@/components/PageIntro";
import { StatList, StatListItem } from "@/components/StatList";
import StylizedImage from "@/components/StylizedImage";
import { TagList, TagListItem } from "@/components/TagList";

import logoFamilyFund from "@/images/clients/family-fund/logomark-dark.svg";
import laptop from "@/images/laptop.jpg";
import whiteboard from "@/images/whiteboard.jpg";

export default function FamilyFund() {
  return (
    <>
      <article className="mt-24 sm:mt-32 lg:mt-40">
        <header>
          <PageIntro
            eyebrow="Case Study"
            title="Skip the bank, borrow from those you trust"
            centered
          >
            <p>
              Family Fund is a crowdfunding platform for friends and family.
              Allowing users to take personal loans from their network without a
              traditional financial institution.
            </p>
          </PageIntro>

          <FadeIn>
            <div className="mt-24 border-t border-neutral-200 bg-white/50 sm:mt-32 lg:mt-40">
              <Container>
                <div className="mx-auto max-w-5xl">
                  <dl className="-mx-6 grid grid-cols-1 text-sm text-neutral-950 sm:mx-0 sm:grid-cols-3">
                    <div className="border-t border-neutral-200 px-6 py-9 sm:border-l sm:border-t-0">
                      <dt className="font-semibold">Client</dt>
                      <dd>
                        <Image
                          src={logoFamilyFund}
                          alt="Family Fund"
                          className="mt-4 h-10 w-10 unoptimized"
                        />
                      </dd>
                    </div>
                    <div className="border-t border-neutral-200 px-6 py-9 sm:border-l sm:border-t-0">
                      <dt className="font-semibold">Year</dt>
                      <dd className="mt-6">
                        <time dateTime="2023-01">2023</time>
                      </dd>
                    </div>
                    <div className="border-t border-neutral-200 px-6 py-9 sm:border-l sm:border-t-0">
                      <dt className="font-semibold">Service</dt>
                      <dd className="mt-6">
                        <TagList className="gap-4">
                          <TagListItem>Web development</TagListItem>
                          <TagListItem>CMS</TagListItem>
                        </TagList>
                      </dd>
                    </div>
                  </dl>
                </div>
              </Container>
            </div>

            <div className="border-y border-neutral-200 bg-neutral-100">
              <div className="-my-px mx-auto max-w-[76rem] bg-neutral-200">
                <div className="relative">
                  <StylizedImage
                    src={laptop}
                    alt="Laptop showing Family Fund interface"
                    className="aspect-[16/10] w-full"
                    sizes="(min-width: 1024px) 1216px, 100vw"
                    shape={0} // Uses the first organic shape variation
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </header>

        <Container className="mt-24 sm:mt-32 lg:mt-40">
          <FadeIn>
            <div className="mx-auto max-w-5xl">
              <h2 className="font-display text-4xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-5xl">
                Reinventing personal lending
              </h2>
              <div className="mt-6 flex flex-col gap-x-8 gap-y-20 text-base text-neutral-600 lg:flex-row">
                <div className="lg:w-1/2">
                  <p>
                    Family Fund approached us with a unique problem: how to make
                    borrowing money from friends and family less awkward and more
                    secure. They wanted a platform that formalized these
                    personal loans without the predatory interest rates of banks
                    or payday lenders.
                  </p>
                  <p className="mt-8">
                    Our team conducted extensive user research to understand the
                    social dynamics of lending money within close circles. We
                    found that the biggest friction point wasn’t the money
                    itself, but the lack of clear terms and tracking.
                  </p>
                </div>
                <div className="lg:w-1/2">
                  <p>
                    We designed a mobile-first experience that prioritizes
                    transparency. Users can set their own repayment schedules,
                    interest rates (if any), and legal agreements with just a
                    few taps.
                  </p>
                  <p className="mt-8">
                    To build trust, we integrated bank-level security for fund
                    transfers and automated reminders so lenders don’t have to
                    play the role of debt collector.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>

        <Container className="mt-24 sm:mt-32 lg:mt-40">
          <FadeIn>
            <div className="mx-auto max-w-5xl">
              <h2 className="font-display text-2xl font-semibold text-neutral-950">
                Key Deliverables
              </h2>
              <GridList className="mt-10">
                <GridListItem title="Custom CMS" className="mt-10">
                  We built a bespoke Content Management System allowing the
                  Family Fund team to manage blog posts, help articles, and
                  legal templates instantly.
                </GridListItem>
                <GridListItem title="Payment Infrastructure" className="mt-10">
                  Integrated Stripe Connect to handle complex split payments and
                  ensure compliance with financial regulations across 50 states.
                </GridListItem>
                <GridListItem title="Mobile App" className="mt-10">
                  A cross-platform React Native app that provides a seamless
                  experience on both iOS and Android devices.
                </GridListItem>
              </GridList>
            </div>
          </FadeIn>
        </Container>

        <div className="relative isolate mt-24 sm:mt-32 lg:mt-40">
          <div className="absolute inset-x-0 top-0 -z-10 h-[1000px] w-full fill-neutral-50 stroke-neutral-950/5 [mask-image:linear-gradient(to_bottom_left,white_40%,transparent_50%)]" />
          <Container>
            <FadeIn>
              <Blockquote
                author={{ name: "Debra Fiscal", role: "CEO of Family Fund" }}
                image={{ src: whiteboard }}
                className="mx-auto max-w-5xl"
              >
                Working with Berztech was a game-changer. They didn’t just build
                an app; they helped us define the entire digital lending category
                for the modern era.
              </Blockquote>
            </FadeIn>
          </Container>
        </div>

        <Container className="mt-24 sm:mt-32 lg:mt-40">
          <FadeIn>
            <StatList>
              <StatListItem value="25%" label="More loans repaid" />
              <StatListItem value="1.5M" label="Users onboarded" />
              <StatListItem value="$20M" label="Raised in Series A" />
              <StatListItem value="4.9" label="App Store Rating" />
            </StatList>
          </FadeIn>
        </Container>
      </article>

      <ContactSection />
    </>
  );
}