/**
 * EVENT SYSTEM — Arkeen Serpent
 * Central pub/sub for decoupled architecture
 */
const listeners = {};

export function on(event, fn) {
  listeners[event] ??= [];
  listeners[event].push(fn);
}

export function off(event, fn) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(f => f !== fn);
}

export function emit(event, data) {
  (listeners[event] || []).forEach(fn => fn(data));
}

export function once(event, fn) {
  const wrapper = (data) => { off(event, wrapper); fn(data); };
  on(event, wrapper);
}
