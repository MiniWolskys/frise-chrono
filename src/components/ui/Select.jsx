import { ChevronDown } from "lucide-react";

export function Select({ palette, options, className = "", ...props }) {
    return (
        <div className={`relative ${className}`}>
            <select
                {...props}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none appearance-none pr-8 cursor-pointer transition-all"
                style={{ background: palette.surface, border: `1.5px solid ${palette.border}`, color: palette.text, colorScheme: "light" }}
            >
                {options.map(o => <option key={o.value} value={o.value} style={{ color: palette.text, background: palette.surface }}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: palette.textLight }} />
        </div>
    );
}
