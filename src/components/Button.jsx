import Link from 'next/link'
import clsx from 'clsx'

function ButtonInner({ className, children, invert, ...props }) {
  return (
    <span
      className={clsx(
        "group relative inline-flex items-center justify-center whitespace-nowrap",

        // Responsive padding
        "px-3 py-1 sm:px-4 sm:py-2 md:px-4 md:py-2",

        // Responsive typography
        "font-inter text-[10px] sm:text-xs md:text-sm font-semibold uppercase",
        "tracking- wider  sm:tracking-widest md:tracking-[0.15em]",

        // Smooth transitions
        "transition-colors duration-200 ease-out",

        // TRUE B/W INVERSION
        invert
          ? "bg-neutral-100 text-black hover:bg-white"
          : "bg-neutral-100 text-black hover:bg-white ",

        className
      )}
      {...props}
    >
      {children}

      {/* Corner Brackets (responsive size + hover expansion) */}
      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-current transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1" />
      
      <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-current transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
      
      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-current transition-transform duration-300 group-hover:-translate-x-1 group-hover:translate-y-1" />
      
      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-current transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
    </span>
  )
}

const Button = ({ invert = false, href, className, children, ...props }) => {
  const outerClassName = clsx(className, "inline-block")

  if (href) {
    return (
      <Link href={href} className={outerClassName} {...props}>
        <ButtonInner invert={invert}>{children}</ButtonInner>
      </Link>
    )
  }

  return (
    <button className={outerClassName} {...props}>
      <ButtonInner invert={invert}>{children}</ButtonInner>
    </button>
  )
}

export default Button
