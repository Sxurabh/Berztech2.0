import React, { forwardRef } from "react";

const Textarea = forwardRef(({ label, className = "", error, ...props }, ref) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={`
                    w-full bg-neutral-50 border p-2.5 text-sm 
                    focus:outline-none focus:border-neutral-900 transition-colors 
                    placeholder:text-neutral-400 font-space-grotesk resize-y min-h-[100px]
                    ${error ? "border-red-300 focus:border-red-500" : "border-neutral-200"}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500 font-space-grotesk">{error}</p>
            )}
        </div>
    );
});

Textarea.displayName = "Textarea";

export default Textarea;
