import { PERIOD_UNITS } from '../constants/config.js';
import { Label, Input, Select } from './ui/index.js';
import { DateInput } from './DateInput.jsx';

export function ConfigPanel({ config, onChange, palette, title, onTitleChange }) {
    const handleDate = (field) => (fd) => onChange(field, fd);
    const handle = (field) => (e) => onChange(field, e.target.value);

    return (
        <div className="space-y-3">
            <h3 style={{ color: palette.text }} className="text-sm font-bold tracking-wide uppercase opacity-60 mb-3">
                Configuration
            </h3>

            <div>
                <Label palette={palette}>Titre</Label>
                <Input
                    palette={palette}
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Ma frise chronologique"
                />
            </div>

            <DateInput
                label="Date de début"
                sub={config.computed === "start" ? "(calculé)" : ""}
                palette={palette}
                computed={config.computed === "start"}
                value={config.startDate}
                onChange={handleDate("startDate")}
            />

            <DateInput
                label="Date de fin"
                sub={config.computed === "end" ? "(calculé)" : ""}
                palette={palette}
                computed={config.computed === "end"}
                value={config.endDate}
                onChange={handleDate("endDate")}
            />

            <div>
                <Label palette={palette} sub={config.computed === "duration" ? "(calculé)" : ""}>Durée</Label>
                <div className="flex gap-2">
                    <div className="w-24">
                        <Input
                            type="number" min="1" palette={palette}
                            value={config.durationQty}
                            onChange={handle("durationQty")}
                            computed={config.computed === "duration"}
                            placeholder="—"
                        />
                    </div>
                    <div className="flex-1">
                        <Select palette={palette} value={config.durationUnit} onChange={handle("durationUnit")} options={PERIOD_UNITS} />
                    </div>
                </div>
            </div>

            <hr style={{ borderColor: palette.borderLight }} className="my-4" />

            <div>
                <Label palette={palette}>Périodicité</Label>
                <div className="flex gap-2">
                    <div className="w-24">
                        <Input type="number" min="1" palette={palette} value={config.periodicityQty} onChange={handle("periodicityQty")} />
                    </div>
                    <div className="flex-1">
                        <Select palette={palette} value={config.periodicityUnit} onChange={handle("periodicityUnit")} options={PERIOD_UNITS} />
                    </div>
                </div>
            </div>
        </div>
    );
}
