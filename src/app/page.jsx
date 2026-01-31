import Clients from "@/components/Clients";
import ContactSection from "@/components/ContactSection";
import Container from "@/components/Container";
import FadeIn from "@/components/FadeIn";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import logoPhobiaDark from "@/images/clients/phobia/logo-dark.svg";

export default function Home() {
  return (
    <main className="w-full bg-white">
      {/* Hero Section - Clean, High-Contrast Minimalism */}
      <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32">
        <Container>
          <FadeIn>
            <h1 className="font-display text-6xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-8xl lg:text-[120px] leading-[0.9]">
              Engineering <br /> 
              Digital <span className="text-neutral-400">Excellence.</span>
            </h1>
            
            <div className="mt-12 max-w-2xl">
              <p className="text-xl leading-relaxed text-neutral-600 sm:text-2xl">
                We are a boutique engineering studio architecting high-performance 
                web applications for the next generation of digital leaders. 
                No templates, just pure code.
              </p>
              
              <div className="mt-10 flex flex-wrap gap-6">
                <button className="rounded-full bg-neutral-950 px-8 py-4 text-base font-semibold text-white transition hover:bg-neutral-800">
                  Start your project
                </button>
                <button className="flex items-center gap-x-2 text-base font-semibold text-neutral-950 hover:text-neutral-600 transition">
                  Explore our process 
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </FadeIn>
        </Container>
      </div>

    

      <Services />

    

      <ContactSection />
    </main>
  );
}