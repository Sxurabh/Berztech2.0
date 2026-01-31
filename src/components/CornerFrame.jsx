// src/components/CornerFrame.jsx
import clsx from 'clsx'

export function CornerFrame({ children, className, ...props }) {
  return (
    <div className={clsx("group relative inline-block w-full", className)} {...props}>
      {children}
      
      {/* Corner Brackets - Replicated from Button.jsx */}
      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-current transition-transform duration-300 group-focus-within:-translate-x-1 group-focus-within:-translate-y-1 group-hover:-translate-x-1 group-hover:-translate-y-1" />
      <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-current transition-transform duration-300 group-focus-within:translate-x-1 group-focus-within:-translate-y-1 group-hover:translate-x-1 group-hover:-translate-y-1" />
      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-current transition-transform duration-300 group-focus-within:-translate-x-1 group-focus-within:translate-y-1 group-hover:-translate-x-1 group-hover:translate-y-1" />
      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-current transition-transform duration-300 group-focus-within:translate-x-1 group-focus-within:translate-y-1 group-hover:translate-x-1 group-hover:translate-y-1" />
    </div>
  )
}