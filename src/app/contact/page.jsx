import Container from "@/components/ui/Container";
import { layoutConfig } from "@/config/layout";
import ContactForm from "@/components/features/contact/ContactForm";
import ContactHeader from "@/components/features/contact/ContactHeader";

export const metadata = {
  title: "Contact Us | Berztech",
  description: "Get in touch with our team to discuss your digital transformation needs.",
};

const ContactPage = () => {
  return (
    <div className="w-full  relative">
      {/* Header */}
      <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-0 z-10">
        <div className={layoutConfig.maxWidth + " " + layoutConfig.padding.mobile + " " + layoutConfig.padding.tablet + " " + layoutConfig.padding.desktop + " mx-auto"}>
          <ContactHeader />
        </div>
      </section>

      <Container className="mt-8 sm:mt-12 lg:mt-16 pb-20 sm:pb-32 z-10 relative">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16">
          <ContactForm />
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;