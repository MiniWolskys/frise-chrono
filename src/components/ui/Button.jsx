export function Btn({ palette, variant = "primary", className = "", children, ...props }) {
    const isPrimary = variant === "primary";
    return (
        <button
            {...props}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${className}`}
            style={{
                background: isPrimary ? palette.primary : "transparent",
                color: isPrimary ? "#fff" : palette.primary,
                border: isPrimary ? "none" : `1.5px solid ${palette.border}`,
                opacity: props.disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!props.disabled) e.target.style.background = isPrimary ? palette.primaryHover : palette.surfaceAlt; }}
            onMouseLeave={(e) => { e.target.style.background = isPrimary ? palette.primary : "transparent"; }}
        >
            {children}
        </button>
    );
}
