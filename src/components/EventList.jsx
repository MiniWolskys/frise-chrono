import { Pencil, Trash2 } from "lucide-react";
import { formatFlexDate } from '../models/flexdate.js';

export function EventList({ events, palette, onEdit, onDelete }) {
    if (events.length === 0) {
        return (
            <p style={{ color: palette.textMuted }} className="text-sm text-center py-6 italic">
                Aucun événement. Cliquez sur « Ajouter » pour commencer.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {events.map((ev, idx) => {
                const colorIndex = ev.colorIndex ?? (idx % palette.eventColors.length);
                const color = palette.eventColors[colorIndex];
                return (
                    <div
                        key={ev.id}
                        className="rounded-xl p-3 flex gap-3 group transition-colors"
                        style={{ background: palette.surfaceAlt, borderLeft: `3px solid ${color}` }}
                    >
                        {ev.image && <img src={ev.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                            <p style={{ color: palette.text }} className="text-sm font-semibold truncate">{ev.title}</p>
                            <p style={{ color: palette.textLight }} className="text-xs mt-0.5">
                                {formatFlexDate(ev.startDate)}
                                {ev.endDate && ` → ${formatFlexDate(ev.endDate)}`}
                            </p>
                            {ev.description && (
                                <p style={{ color: palette.textMuted }} className="text-xs mt-1 truncate">{ev.description}</p>
                            )}
                        </div>
                        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(ev)} className="p-1.5 rounded-lg cursor-pointer hover:bg-black/5 transition-colors">
                                <Pencil size={13} style={{ color: palette.textLight }} />
                            </button>
                            <button onClick={() => onDelete(ev.id)} className="p-1.5 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                                <Trash2 size={13} className="text-red-400" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
