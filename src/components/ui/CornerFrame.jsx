import clsx from 'clsx'

export function CornerFrame({ children, className, bracketClassName, ...props }) {
  // 1. Define the exact defaults from your Button component
  const defaultSize = "w-1.5 h-1.5";
  const defaultBorder = "border-current";
  
  // 2. Helper to merge defaults with overrides
  // We apply the 'zero' border classes (e.g., border-r-0) LAST to ensure they 
  // strictly enforce the L-shape even if you pass 'border-2' (which sets all sides).
  
  // Top Left: Needs Top & Left. Kill Right & Bottom.
  const topLeft = clsx(
    defaultSize, defaultBorder, bracketClassName,
    "border-t border-l border-r-0 border-b-0" 
  );

  // Top Right: Needs Top & Right. Kill Left & Bottom.
  const topRight = clsx(
    defaultSize, defaultBorder, bracketClassName,
    "border-t border-r border-l-0 border-b-0"
  );

  // Bottom Left: Needs Bottom & Left. Kill Top & Right.
  const bottomLeft = clsx(
    defaultSize, defaultBorder, bracketClassName,
    "border-b border-l border-t-0 border-r-0"
  );

  // Bottom Right: Needs Bottom & Right. Kill Top & Left.
  const bottomRight = clsx(
    defaultSize, defaultBorder, bracketClassName,
    "border-b border-r border-t-0 border-l-0"
  );

  return (
    <div className={clsx("group relative inline-block w-full", className)} {...props}>
      {children}
      
      {/* Top Left */}
      <span className={clsx(
        "absolute top-0 left-0 transition-transform duration-300",
        "group-focus-within:-translate-x-1 group-focus-within:-translate-y-1", 
        "group-hover:-translate-x-1 group-hover:-translate-y-1",
        topLeft
      )} />
      
      {/* Top Right */}
      <span className={clsx(
        "absolute top-0 right-0 transition-transform duration-300",
        "group-focus-within:translate-x-1 group-focus-within:-translate-y-1",
        "group-hover:translate-x-1 group-hover:-translate-y-1",
        topRight
      )} />
      
      {/* Bottom Left */}
      <span className={clsx(
        "absolute bottom-0 left-0 transition-transform duration-300",
        "group-focus-within:-translate-x-1 group-focus-within:translate-y-1",
        "group-hover:-translate-x-1 group-hover:translate-y-1",
        bottomLeft
      )} />
      
      {/* Bottom Right */}
      <span className={clsx(
        "absolute bottom-0 right-0 transition-transform duration-300",
        "group-focus-within:translate-x-1 group-focus-within:translate-y-1",
        "group-hover:translate-x-1 group-hover:translate-y-1",
        bottomRight
      )} />
    </div>
  )
}