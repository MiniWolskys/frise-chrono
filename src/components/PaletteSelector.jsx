import { PALETTES } from '../constants/palettes.js';

export function PaletteSelector({ current, onChange, palette }) {
    return (
        <div className="flex items-center gap-2">
            <span style={{ color: palette.textLight }} className="text-xs font-medium">Thème</span>
            <div className="flex gap-1.5">
                {Object.entries(PALETTES).map(([key, p]) => (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className="w-6 h-6 rounded-full cursor-pointer transition-all"
                        style={{
                            background: p.preview,
                            boxShadow: current === key ? `0 0 0 2px ${palette.surface}, 0 0 0 3.5px ${p.preview}` : "none",
                            transform: current === key ? "scale(1.15)" : "scale(1)",
                        }}
                        title={p.name}
                    />
                ))}
            </div>
        </div>
    );
}
