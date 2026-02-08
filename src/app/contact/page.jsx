import Container from "@/components/ui/Container";
import { layoutConfig } from "@/config/layout";
import GridBackground from "@/components/ui/GridBackground";
import ContactForm from "@/components/features/contact/ContactForm";
import ContactHeader from "@/components/features/contact/ContactHeader";

const ContactPage = () => {
  return (
    <div className="w-full bg-white relative">
      {/* Grid Background - Fixed like homepage */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <GridBackground opacity={0.04} size={40} />
      </div>
      
      {/* Header */}
      <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-8 z-10">
        <div className={layoutConfig.maxWidth + " " + layoutConfig.padding.mobile + " " + layoutConfig.padding.tablet + " " + layoutConfig.padding.desktop + " mx-auto"}>
          <ContactHeader />
        </div>
      </section>

      <Container className="mt-16 sm:mt-20 lg:mt-24 pb-20 sm:pb-32 z-10 relative">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
          
          <ContactForm />
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;