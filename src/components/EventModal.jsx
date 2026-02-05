import { useState } from "react";
import { Download, X, Check } from "lucide-react";
import { EMPTY_FLEXDATE, isFlexDateValid, flexAfter } from '../models/flexdate.js';
import { Label, Input, Btn } from './ui/index.js';
import { DateInput } from './DateInput.jsx';

export function EventModal({ onSubmit, onClose, initial, palette, defaultColorIndex = 0 }) {
    const [form, setForm] = useState({
        title: initial?.title || "",
        startDate: initial?.startDate || { ...EMPTY_FLEXDATE },
        endDate: initial?.endDate || null,
        description: initial?.description || "",
        image: initial?.image || null,
        hasEndDate: !!initial?.endDate,
        colorIndex: initial?.colorIndex ?? defaultColorIndex,
    });
    const [errors, setErrors] = useState({});

    const setField = (field) => (val) => setForm(p => ({ ...p, [field]: val }));

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setForm(p => ({ ...p, image: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = "Titre requis";
        if (!isFlexDateValid(form.startDate)) errs.startDate = "Date requise";
        if (form.hasEndDate && form.endDate) {
            if (!isFlexDateValid(form.endDate)) {
                errs.endDate = "Date invalide";
            } else if (!flexAfter(form.endDate, form.startDate)) {
                errs.endDate = "Doit être après la date de début";
            }
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submit = () => {
        if (!validate()) return;
        onSubmit({
            title: form.title.trim(),
            startDate: form.startDate,
            endDate: form.hasEndDate && isFlexDateValid(form.endDate) ? form.endDate : null,
            description: form.description.trim() || null,
            image: form.image,
            colorIndex: form.colorIndex,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div
                className="relative rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4 max-h-[90vh] overflow-y-auto"
                style={{ background: palette.surface }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 style={{ color: palette.text }} className="text-lg font-bold">
                        {initial ? "Modifier l'événement" : "Nouvel événement"}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg cursor-pointer transition-colors hover:bg-black/5">
                        <X size={18} style={{ color: palette.textLight }} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label palette={palette}>Titre *</Label>
                        <Input
                            palette={palette}
                            value={form.title}
                            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="Ex: Révolution française"
                        />
                        {errors.title && <p className="text-xs mt-1 text-red-500">{errors.title}</p>}
                    </div>

                    <div>
                        <Label palette={palette}>Couleur</Label>
                        <div className="flex gap-2 mt-1">
                            {palette.eventColors.map((color, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, colorIndex: idx }))}
                                    className="w-8 h-8 rounded-full cursor-pointer transition-all flex items-center justify-center"
                                    style={{
                                        background: color,
                                        transform: form.colorIndex === idx ? 'scale(1.15)' : 'scale(1)',
                                        boxShadow: form.colorIndex === idx ? `0 0 0 2px ${palette.surface}, 0 0 0 4px ${color}` : 'none',
                                    }}
                                    title={`Couleur ${idx + 1}`}
                                >
                                    {form.colorIndex === idx && <Check size={14} color={palette.surface} strokeWidth={3} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DateInput
                        label="Date de début *"
                        palette={palette}
                        value={form.startDate}
                        onChange={setField("startDate")}
                    />
                    {errors.startDate && <p className="text-xs -mt-2 text-red-500">{errors.startDate}</p>}

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                                type="checkbox"
                                checked={form.hasEndDate}
                                onChange={(e) => setForm(p => ({
                                    ...p,
                                    hasEndDate: e.target.checked,
                                    endDate: e.target.checked ? (p.endDate || { ...EMPTY_FLEXDATE }) : null,
                                }))}
                                className="rounded cursor-pointer"
                                style={{ accentColor: palette.primary }}
                            />
                            <span style={{ color: palette.text }} className="text-xs font-semibold">Période (date de fin)</span>
                        </label>
                        {form.hasEndDate && (
                            <DateInput
                                palette={palette}
                                value={form.endDate || EMPTY_FLEXDATE}
                                onChange={setField("endDate")}
                            />
                        )}
                        {errors.endDate && <p className="text-xs mt-1 text-red-500">{errors.endDate}</p>}
                    </div>

                    <div>
                        <Label palette={palette} sub="(optionnel)">Description</Label>
                        <textarea
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                            rows={2}
                            style={{ background: palette.surface, border: `1.5px solid ${palette.border}`, color: palette.text }}
                            value={form.description}
                            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Détails supplémentaires…"
                        />
                    </div>

                    <div>
                        <Label palette={palette} sub="(optionnel)">Image</Label>
                        <div className="flex items-center gap-3">
                            <label
                                className="rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2"
                                style={{ border: `1.5px solid ${palette.border}`, color: palette.textLight }}
                            >
                                <Download size={14} />
                                Choisir un fichier
                                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                            </label>
                            {form.image && (
                                <div className="flex items-center gap-2">
                                    <img src={form.image} alt="" className="w-8 h-8 rounded object-cover" />
                                    <button onClick={() => setForm(p => ({ ...p, image: null }))} className="text-red-400 cursor-pointer">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Btn palette={palette} variant="ghost" onClick={onClose}>Annuler</Btn>
                    <Btn palette={palette} onClick={submit}>{initial ? "Modifier" : "Ajouter"}</Btn>
                </div>
            </div>
        </div>
    );
}
