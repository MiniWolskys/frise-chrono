import { CANVAS_PAD, TITLE_HEIGHT, ROW_HEIGHT, BAR_HEIGHT } from '../constants/config.js';
import {
    flexToTimestamp,
    formatFlexDate,
    formatFlexTickLabel,
    generateFlexTicks,
} from '../models/flexdate.js';
import { computeEventLayout, wrapText, roundRect } from '../utils/canvasHelpers.js';

export function renderTimeline(ctx, W, H, config, events, palette, images, title) {
    const font = "Outfit, system-ui, sans-serif";

    ctx.fillStyle = palette.surface;
    ctx.fillRect(0, 0, W, H);

    const titleH = title ? TITLE_HEIGHT : 0;
    const axisY = H - CANVAS_PAD.bottom;
    const axisLeft = CANVAS_PAD.left;
    const axisRight = W - CANVAS_PAD.right;
    const startTs = flexToTimestamp(config.startDate);
    const endTs = flexToTimestamp(config.endDate);
    if (!startTs || !endTs || endTs <= startTs) return;

    const span = endTs - startTs;
    const dateToX = (fd) => {
        const ts = flexToTimestamp(fd);
        if (ts === null) return axisLeft;
        return axisLeft + ((ts - startTs) / span) * (axisRight - axisLeft);
    };

    // Axis line
    ctx.strokeStyle = palette.axis;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(axisLeft, axisY);
    ctx.lineTo(axisRight, axisY);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = palette.axis;
    ctx.beginPath();
    ctx.moveTo(axisRight + 2, axisY);
    ctx.lineTo(axisRight - 10, axisY - 7);
    ctx.lineTo(axisRight - 10, axisY + 7);
    ctx.closePath();
    ctx.fill();

    // Start cap
    ctx.beginPath();
    ctx.moveTo(axisLeft, axisY - 8);
    ctx.lineTo(axisLeft, axisY + 8);
    ctx.stroke();

    // Ticks
    const ticks = generateFlexTicks(config.startDate, config.endDate, config.periodicityQty, config.periodicityUnit);

    const showLabel = ticks.map(() => true);
    if (ticks.length > 1) {
        const minGap = 55;
        let lastShownX = -Infinity;
        for (let i = 0; i < ticks.length; i++) {
            const tx = dateToX(ticks[i]);
            if (tx - lastShownX < minGap && i > 0 && i < ticks.length - 1) {
                showLabel[i] = false;
            } else {
                lastShownX = tx;
            }
        }
    }

    ticks.forEach((tick, i) => {
        const tx = dateToX(tick);
        ctx.strokeStyle = palette.tick;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx, axisY - 6);
        ctx.lineTo(tx, axisY + 6);
        ctx.stroke();

        if (showLabel[i]) {
            const isFirst = i === 0;
            const isLast = i === ticks.length - 1;
            ctx.fillStyle = (isFirst || isLast) ? palette.text : palette.textLight;
            ctx.font = (isFirst || isLast) ? `500 11px ${font}` : `400 11px ${font}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            const label = isFirst ? formatFlexDate(config.startDate)
                : isLast ? formatFlexDate(config.endDate)
                : formatFlexTickLabel(tick, config.periodicityUnit);
            ctx.fillText(label, tx, axisY + 12);
        }
    });

    // Events
    const layout = computeEventLayout(events, dateToX);

    layout.forEach((ev) => {
        const colorIdx = events.findIndex(e => e.id === ev.id) % palette.eventColors.length;
        const color = palette.eventColors[colorIdx];
        const rowY = axisY - 18 - (ev.row + 1) * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2;

        if (ev.ex !== null) {
            const barW = Math.max(ev.ex - ev.x, 30);

            ctx.save();
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = color + "55";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ev.x, rowY + BAR_HEIGHT);
            ctx.lineTo(ev.x, axisY);
            ctx.moveTo(ev.ex, rowY + BAR_HEIGHT);
            ctx.lineTo(ev.ex, axisY);
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = color + "22";
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            roundRect(ctx, ev.x, rowY, barW, BAR_HEIGHT, 5);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = palette.text;
            ctx.font = `500 12px ${font}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            const maxTextW = barW - 14;
            let titleText = ev.title;
            while (ctx.measureText(titleText).width > maxTextW && titleText.length > 1) titleText = titleText.slice(0, -1);
            if (titleText !== ev.title) titleText += "\u2026";
            ctx.fillText(titleText, ev.x + 7, rowY + BAR_HEIGHT / 2);

            // Date below title
            const dateStr = formatFlexDate(ev.startDate) + (ev.endDate ? " \u2192 " + formatFlexDate(ev.endDate) : "");
            ctx.fillStyle = palette.textLight;
            ctx.font = `400 10px ${font}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            let dateY = rowY + BAR_HEIGHT + 3;
            const maxDateW = barW - 14;
            if (maxDateW > 20) {
                let dateTrunc = dateStr;
                while (ctx.measureText(dateTrunc).width > maxDateW && dateTrunc.length > 1) dateTrunc = dateTrunc.slice(0, -1);
                if (dateTrunc !== dateStr) dateTrunc += "\u2026";
                ctx.fillText(dateTrunc, ev.x + 7, dateY);
                dateY += 14;
            }

            if (ev.description) {
                ctx.fillStyle = palette.textMuted;
                ctx.font = `400 10px ${font}`;
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                const maxDescW = barW - 14;
                if (maxDescW > 20) {
                    const descLines = wrapText(ctx, ev.description, maxDescW, 2);
                    descLines.forEach((line, i) => {
                        ctx.fillText(line, ev.x + 7, dateY + i * 14);
                    });
                }
            }
        } else {
            ctx.save();
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = color + "66";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ev.x, rowY + BAR_HEIGHT / 2 + 7);
            ctx.lineTo(ev.x, axisY);
            ctx.stroke();
            ctx.restore();

            ctx.beginPath();
            ctx.arc(ev.x, rowY + BAR_HEIGHT / 2, 6, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = palette.surface;
            ctx.lineWidth = 2;
            ctx.stroke();

            const textX = ev.x + 14;
            const maxTextW = Math.min(200, W - CANVAS_PAD.right - textX);

            ctx.fillStyle = palette.text;
            ctx.font = `500 12px ${font}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            const titleLines = wrapText(ctx, ev.title, maxTextW, 2);
            let textY = rowY + BAR_HEIGHT / 2 - 6;
            titleLines.forEach((line, i) => {
                ctx.fillText(line, textX, textY + i * 14);
            });
            textY += titleLines.length * 14 + 2;

            // Date below title
            const dateStr = formatFlexDate(ev.startDate);
            ctx.fillStyle = palette.textLight;
            ctx.font = `400 10px ${font}`;
            const dateLines = wrapText(ctx, dateStr, maxTextW, 1);
            dateLines.forEach((line, i) => {
                ctx.fillText(line, textX, textY + i * 12);
            });
            textY += dateLines.length * 12 + 2;

            if (ev.description) {
                ctx.fillStyle = palette.textMuted;
                ctx.font = `400 10px ${font}`;
                const descLines = wrapText(ctx, ev.description, maxTextW, 2);
                descLines.forEach((line, i) => {
                    ctx.fillText(line, textX, textY + i * 12);
                });
            }
        }

        const img = images?.[ev.id];
        if (img) {
            const maxSize = 128;
            const natW = img.naturalWidth;
            const natH = img.naturalHeight;
            const bigger = Math.max(natW, natH);
            const scale = bigger > maxSize ? maxSize / bigger : 1;
            const drawW = natW * scale;
            const drawH = natH * scale;
            const imgX = ev.x - drawW / 2;
            const imgY = rowY - drawH - 4;
            ctx.save();
            roundRect(ctx, imgX, imgY, drawW, drawH, 4);
            ctx.clip();
            ctx.drawImage(img, imgX, imgY, drawW, drawH);
            ctx.restore();
        }
    });

    // Title section — drawn last so it's always above event content
    if (title) {
        ctx.fillStyle = palette.surface;
        ctx.fillRect(0, 0, W, titleH);
        ctx.fillStyle = palette.text;
        ctx.font = `600 16px ${font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(title, W / 2, titleH / 2);
    }
}
