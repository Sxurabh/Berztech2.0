import React, { forwardRef } from "react";

const Select = forwardRef(({ label, options = [], className = "", error, ...props }, ref) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
                    w-full bg-neutral-50 border p-2.5 text-sm 
                    focus:outline-none focus:border-neutral-900 transition-colors 
                    font-space-grotesk
                    ${error ? "border-red-300 focus:border-red-500" : "border-neutral-200"}
                `}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                        {opt.label || opt}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-xs text-red-500 font-space-grotesk">{error}</p>
            )}
        </div>
    );
});

Select.displayName = "Select";

export default Select;
