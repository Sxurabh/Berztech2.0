import ContactSection from "@/components/ContactSection";
import Container from "@/components/Container";
import FadeIn from "@/components/FadeIn";
import Services from "@/components/Services";
import Button from "@/components/Button"; // Use the redesigned component

export default function Home() {
  return (
    <main className="w-full bg-white">
      <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32">
        <Container>
          <FadeIn>
            <h1 className="font-space-grotesk text-6xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-8xl lg:text-[120px] leading-[0.9]">
              Engineering <br /> 
              Digital <span className="text-neutral-400">Excellence.</span>
            </h1>
            
            <div className="mt-12 max-w-2xl">
              <p className="font-jetbrains-mono text-l leading-relaxed text-neutral-600 sm:text-xl">
                We are a boutique engineering studio architecting high-performance 
                web applications for the next generation of digital leaders. 
                No templates, just pure code.
              </p>
              
              <div className="mt-10 flex  gap-6">
                {/* Redesigned Button - Primary */}
                <Button href="/contact" className="w-full sm:w-auto">
                  Start your project
                </Button>
                
                {/* Redesigned Button - Secondary/Invert */}
                <Button href="/process" className="w-full sm:w-auto">
                  Explore our process
                </Button>
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