import React, { forwardRef, useId } from "react";

const Input = forwardRef(({ label, className = "", error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={errorId}
                className={`
                    w-full bg-neutral-50 border p-2.5 text-sm 
                    focus:outline-none focus:border-neutral-900 transition-colors 
                    placeholder:text-neutral-400 font-space-grotesk
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

Input.displayName = "Input";

export default Input;
