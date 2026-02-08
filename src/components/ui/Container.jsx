// src/components/Container.jsx
import clsx from "clsx";
import { layoutConfig } from "@/config/layout";

export function Container({ 
  children, 
  className, 
  as: Component = "div",
  size = "default", // default, tight, hero, full
  ...props 
}) {
  const spacingClasses = {
    default: layoutConfig.spacing.section,
    tight: layoutConfig.spacing.tight,
    hero: layoutConfig.spacing.hero,
    full: "",
  };

  return (
    <Component
      className={clsx(
        "relative w-full",
        spacingClasses[size],
        className
      )}
      {...props}
    >
      <div className={clsx(
        "mx-auto w-full",
        layoutConfig.maxWidth,
        layoutConfig.padding.mobile,
        layoutConfig.padding.tablet,
        layoutConfig.padding.desktop
      )}>
        {children}
      </div>
    </Component>
  );
}

export function Grid({ children, className, ...props }) {
  return (
    <div 
      className={clsx(
        "grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GridItem({ children, className, colSpan = "full", ...props }) {
  const spans = {
    full: "col-span-12",
    half: "col-span-12 lg:col-span-6",
    third: "col-span-12 sm:col-span-6 lg:col-span-4",
    twoThirds: "col-span-12 lg:col-span-8",
    quarter: "col-span-6 sm:col-span-3",
    content: "col-span-12 lg:col-span-8",
    sidebar: "col-span-12 lg:col-span-5",
  };

  return (
    <div className={clsx(spans[colSpan] || spans.full, className)} {...props}>
      {children}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, align = "left", action }) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={clsx("mb-8 sm:mb-10", alignClasses[align])}>
      {eyebrow && (
        <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
          <div className="h-px w-4 bg-neutral-300 hidden sm:block" />
          <span className={layoutConfig.typography.eyebrow}>{eyebrow}</span>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h2 className={layoutConfig.typography.h2}>
          {title}
          {subtitle && (
            <>
              <br />
              <span className="text-neutral-400">{subtitle}</span>
            </>
          )}
        </h2>
        {action && (
          <div className="shrink-0">{action}</div>
        )}
      </div>
    </div>
  );
}

export default Container;