/**
 * MATH UTILS — Arkeen Serpent
 */
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function dist(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
