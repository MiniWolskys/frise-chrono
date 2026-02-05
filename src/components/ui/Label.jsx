export function Label({ children, sub, palette }) {
    return (
        <label style={{ color: palette.text }} className="block text-xs font-semibold mb-1">
            {children}
            {sub && <span style={{ color: palette.textMuted }} className="font-normal ml-1">{sub}</span>}
        </label>
    );
}
