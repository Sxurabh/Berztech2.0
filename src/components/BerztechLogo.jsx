import clsx from "clsx";

export function BerztechLogo({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 100 30" // 👈 ADJUST THIS viewBox to match your SVG's original dimensions
      fill="currentColor" // This allows the parent to control color (white/black)
      aria-hidden="true"
      className={clsx("fill-current", className)}
      {...props}
    >
      {/* PASTE YOUR PATH CODE HERE. Example: */}
      {/* <path d="M10 10 H 90 V 90 H 10 L 10 10" /> */}
      
    </svg>
  );
}