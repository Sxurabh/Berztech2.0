import React, { forwardRef, useId } from "react";

const Textarea = forwardRef(({ label, className = "", error, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={textareaId} className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                id={textareaId}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={errorId}
                className={`
                    w-full bg-neutral-50 border p-2.5 text-sm 
                    focus:outline-none focus:border-neutral-900 transition-colors 
                    placeholder:text-neutral-400 font-space-grotesk resize-y min-h-[100px]
                    ${error ? "border-red-300 focus:border-red-500" : "border-neutral-200"}
                `}
                {...props}
            />
            {error && (
                <p id={errorId} className="mt-1 text-xs text-red-500 font-space-grotesk" role="alert">{error}</p>
            )}
        </div>
    );
});

Textarea.displayName = "Textarea";

export default Textarea;
