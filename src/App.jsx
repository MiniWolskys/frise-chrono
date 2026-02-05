import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Download } from "lucide-react";

import { PALETTES } from './constants/palettes.js';
import { CANVAS_PAD, TITLE_HEIGHT, ROW_HEIGHT, BASE_CANVAS_HEIGHT } from './constants/config.js';
import { EMPTY_FLEXDATE, isFlexDateValid, flexAfter, flexToTimestamp } from './models/flexdate.js';
import { autoComputeConfig } from './utils/configCompute.js';
import { computeEventLayout } from './utils/canvasHelpers.js';
import { renderTimeline } from './rendering/timelineRenderer.js';

import { Btn } from './components/ui/index.js';
import { ConfigPanel } from './components/ConfigPanel.jsx';
import { EventModal } from './components/EventModal.jsx';
import { EventList } from './components/EventList.jsx';
import { PaletteSelector } from './components/PaletteSelector.jsx';

export default function TimelineApp() {
    const [config, setConfig] = useState({
        startDate: { ...EMPTY_FLEXDATE },
        endDate: { ...EMPTY_FLEXDATE },
        durationQty: "",
        durationUnit: "months",
        periodicityQty: 1,
        periodicityUnit: "years",
        computed: null,
    });
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState("");
    const [paletteName, setPaletteName] = useState("terracotta");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [canvasWidth, setCanvasWidth] = useState(800);

    const palette = PALETTES[paletteName];
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const handleConfigChange = (field, value) => {
        setConfig(prev => autoComputeConfig({ ...prev, [field]: value }, field));
    };

    const isConfigValid = useMemo(() => {
        return isFlexDateValid(config.startDate)
            && isFlexDateValid(config.endDate)
            && flexAfter(config.endDate, config.startDate)
            && config.periodicityQty > 0;
    }, [config]);

    const numEventRows = useMemo(() => {
        if (!isConfigValid || events.length === 0) return 0;
        const startTs = flexToTimestamp(config.startDate);
        const endTs = flexToTimestamp(config.endDate);
        const span = endTs - startTs;
        if (span <= 0) return 0;
        const dateToX = (fd) => {
            const ts = flexToTimestamp(fd);
            return CANVAS_PAD.left + ((ts - startTs) / span) * (canvasWidth - CANVAS_PAD.left - CANVAS_PAD.right);
        };
        const layout = computeEventLayout(events, dateToX);
        return layout.length > 0 ? Math.max(...layout.map(ev => ev.row)) + 1 : 0;
    }, [events, config, canvasWidth, isConfigValid]);

    const titleH = title.trim() ? TITLE_HEIGHT : 0;
    const canvasHeight = BASE_CANVAS_HEIGHT + numEventRows * ROW_HEIGHT + titleH;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new ResizeObserver(entries => setCanvasWidth(Math.max(entries[0].contentRect.width, 500)));
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!isConfigValid) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        (async () => {
            await document.fonts.ready;
            const images = {};
            await Promise.all(events.filter(e => e.image).map(e =>
                new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => { images[e.id] = img; resolve(); };
                    img.onerror = resolve;
                    img.src = e.image;
                })
            ));

            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvasWidth * dpr;
            canvas.height = canvasHeight * dpr;
            canvas.style.width = canvasWidth + "px";
            canvas.style.height = canvasHeight + "px";
            const ctx = canvas.getContext("2d");
            ctx.scale(dpr, dpr);
            renderTimeline(ctx, canvasWidth, canvasHeight, config, events, palette, images, title);
        })();
    }, [config, events, palette, canvasWidth, canvasHeight, isConfigValid, title]);

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    const openAdd = () => { setEditingEvent(null); setModalOpen(true); };
    const openEdit = (ev) => { setEditingEvent(ev); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditingEvent(null); };

    const handleEventSubmit = (data) => {
        if (editingEvent) {
            setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...data, id: e.id } : e));
        } else {
            setEvents(prev => [...prev, { ...data, id: crypto.randomUUID() }]);
        }
        closeModal();
    };

    const handleDelete = (id) => setEvents(prev => prev.filter(e => e.id !== id));

    const exportImage = (format) => {
        if (!isConfigValid) return;
        (async () => {
            const images = {};
            await Promise.all(events.filter(e => e.image).map(e =>
                new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => { images[e.id] = img; resolve(); };
                    img.onerror = resolve;
                    img.src = e.image;
                })
            ));

            const scale = 2;
            const expCanvas = document.createElement("canvas");
            expCanvas.width = canvasWidth * scale;
            expCanvas.height = canvasHeight * scale;
            const ctx = expCanvas.getContext("2d");
            ctx.scale(scale, scale);
            renderTimeline(ctx, canvasWidth, canvasHeight, config, events, palette, images, title);

            const mime = format === "jpg" ? "image/jpeg" : "image/png";
            expCanvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                const slug = title.trim()
                    ? title.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                    : "frise-chronologique";
                a.download = `${slug}.${format}`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 100);
            }, mime, 0.95);
        })();
    };

    return (
        <div className="h-screen flex flex-col" style={{ background: palette.bg, fontFamily: "Outfit, system-ui, sans-serif", color: palette.text }}>
            <header
                className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                style={{ background: palette.surface, borderBottom: `1px solid ${palette.borderLight}` }}
            >
                <h1 className="text-lg font-bold tracking-tight" style={{ color: palette.primary }}>
                    ⏤ Frise Chrono
                </h1>
                <PaletteSelector current={paletteName} onChange={setPaletteName} palette={palette} />
                <div className="flex gap-2">
                    <Btn palette={palette} variant="ghost" disabled={!isConfigValid} onClick={() => exportImage("png")}>
                        <Download size={14} /> PNG
                    </Btn>
                    <Btn palette={palette} variant="ghost" disabled={!isConfigValid} onClick={() => exportImage("jpg")}>
                        <Download size={14} /> JPG
                    </Btn>
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                <aside
                    className="w-80 flex-shrink-0 overflow-y-auto p-5 space-y-5"
                    style={{ background: palette.surface, borderRight: `1px solid ${palette.borderLight}` }}
                >
                    <ConfigPanel config={config} onChange={handleConfigChange} palette={palette} title={title} onTitleChange={setTitle} />
                    <hr style={{ borderColor: palette.borderLight }} />
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 style={{ color: palette.text }} className="text-sm font-bold tracking-wide uppercase opacity-60">
                                Événements
                            </h3>
                            <Btn palette={palette} className="py-1.5 px-3 text-xs" disabled={!isConfigValid} onClick={openAdd}>
                                <Plus size={14} /> Ajouter
                            </Btn>
                        </div>
                        <EventList events={events} palette={palette} onEdit={openEdit} onDelete={handleDelete} />
                    </div>
                </aside>

                <main className="flex-1 overflow-auto p-6 flex items-start justify-center" ref={containerRef}>
                    {!isConfigValid ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 gap-3">
                            <div className="text-5xl">📅</div>
                            <p style={{ color: palette.textLight }} className="text-sm text-center max-w-xs">
                                Renseignez les dates de début, de fin (ou la durée) et la périodicité pour afficher votre frise chronologique.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full">
                            <canvas
                                ref={canvasRef}
                                className="rounded-xl shadow-lg w-full"
                                style={{ background: palette.surface }}
                            />
                        </div>
                    )}
                </main>
            </div>

            {modalOpen && (
                <EventModal
                    palette={palette}
                    initial={editingEvent}
                    onSubmit={handleEventSubmit}
                    onClose={closeModal}
                    defaultColorIndex={events.length % palette.eventColors.length}
                />
            )}
        </div>
    );
}
