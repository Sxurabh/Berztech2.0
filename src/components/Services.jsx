import React from "react";
import SectionIntro from "./SectionIntro";
import Container from "./Container";
import FadeIn from "./FadeIn";
import StylizedImage from "./StylizedImage";
import imageLaptop from "../images/laptop.jpg";
import List, { ListItem } from "./List";

const Services = () => {
  return (
    <>
      <SectionIntro
        eyebrow="Expertise"
        title="We help you identify, explore and respond to new opportunities."
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          Our approach combines deep technical proficiency with an obsession for 
          user-centric design. We build tools that don't just work—they inspire.
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <div className="lg:flex lg:items-center lg:justify-end">
          <div className="flex justify-center lg:w-1/2 lg:justify-end lg:pr-12">
            <FadeIn className="w-[33.75rem] flex-none lg:w-[45rem]">
              <StylizedImage
                src={imageLaptop}
                sizes="(min-width: 1024px) 41rem, 31rem"
                className="justify-center lg:justify-end"
              />
            </FadeIn>
          </div>
          
          <List className="mt-16 lg:mt-0 lg:w-1/2 lg:min-w-[33rem] lg:pl-4">
            <ListItem title="Full-Stack Web Development">
              High-performance, SEO-optimized web applications built with 
              Next.js, React, and robust backend architectures.
            </ListItem>
            <ListItem title="Scalable App Infrastructure">
              Cloud-native development focusing on AWS/Vercel deployments, 
              ensuring your application scales with your user base.
            </ListItem>
            <ListItem title="E-commerce Solutions">
              Custom headless commerce experiences using Shopify Hydrogen 
              or MedusaJS for brands that have outgrown standard templates.
            </ListItem>
            <ListItem title="Legacy Modernization">
              Refactoring outdated systems into modern, maintainable codebases 
              without disrupting your ongoing business operations.
            </ListItem>
          </List>
        </div>
      </Container>
    </>
  );
};

export default Services;