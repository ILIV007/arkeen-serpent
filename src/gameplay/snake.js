/**
 * SNAKE — Arkeen Serpent
 * Pure movement logic. No rendering, no audio.
 */
import { state } from '../core/state.js';

export function moveSnake() {
  const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
  state.snake.unshift(head);
}

export function growSnake() {
  // Already grown by moveSnake; do nothing on eat
}

export function shrinkTail() {
  state.snake.pop();
}
