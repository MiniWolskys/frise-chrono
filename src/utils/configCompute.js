import {
    isFlexDateValid,
    addDurationToFlex,
    computeDurationBetween,
} from '../models/flexdate.js';

export function autoComputeConfig(cfg, changed) {
    const next = { ...cfg };
    const hasStart = isFlexDateValid(next.startDate);
    const hasEnd = isFlexDateValid(next.endDate);
    const hasDur = !!next.durationQty && parseInt(next.durationQty, 10) > 0;

    if (changed === "startDate" || changed === "endDate") {
        if (hasStart && hasEnd) {
            const dur = computeDurationBetween(next.startDate, next.endDate);
            if (dur) { next.durationQty = dur.qty; next.durationUnit = dur.unit; next.computed = "duration"; }
        } else if (changed === "startDate" && hasStart && hasDur) {
            const end = addDurationToFlex(next.startDate, next.durationQty, next.durationUnit);
            if (end) { next.endDate = end; next.computed = "end"; }
        } else if (changed === "endDate" && hasEnd && hasDur) {
            const start = addDurationToFlex(next.endDate, -parseInt(next.durationQty), next.durationUnit);
            if (start) { next.startDate = start; next.computed = "start"; }
        }
    } else if (changed === "durationQty" || changed === "durationUnit") {
        if (hasDur && hasStart) {
            const end = addDurationToFlex(next.startDate, next.durationQty, next.durationUnit);
            if (end) { next.endDate = end; next.computed = "end"; }
        } else if (hasDur && hasEnd) {
            const start = addDurationToFlex(next.endDate, -parseInt(next.durationQty), next.durationUnit);
            if (start) { next.startDate = start; next.computed = "start"; }
        }
    }
    return next;
}
