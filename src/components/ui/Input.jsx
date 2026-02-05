export function Input({ palette, computed, className = "", ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-all ${className}`}
            style={{
                background: computed ? palette.surfaceAlt : palette.surface,
                border: `1.5px solid ${palette.border}`,
                color: palette.text,
                fontStyle: computed ? "italic" : "normal",
                ...(props.style || {}),
            }}
            onFocus={(e) => { e.target.style.borderColor = palette.primary; props.onFocus?.(e); }}
            onBlur={(e) => { e.target.style.borderColor = palette.border; props.onBlur?.(e); }}
        />
    );
}
