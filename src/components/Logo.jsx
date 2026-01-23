import clsx from "clsx";
import Link from "next/link";

const Logo = ({ invert, href, className, children, ...props }) => {
  // Base classes for both Link and div/h2 variants
  const baseClassName = clsx(
    className,
    "black block duration-300 cursor-pointer", // Added 'block' for better spacing
    invert ? "text-white hover:text-blue-600" : "text-black hover:text-blue-600"
  );

  const inner = <span className="relative flex items-center">{children}</span>;

  if (href) {
    return (
      <Link href={href} className={baseClassName} {...props}>
        {inner}
      </Link>
    );
  }

  return (
    <h2
      className={clsx("text-2xl font-semibold", baseClassName)} // Kept text styles only for non-link text usage if needed
      {...props}
    >
      {inner}
    </h2>
  );
};

export default Logo;