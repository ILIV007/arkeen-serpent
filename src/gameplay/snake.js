import { state } from '../core/state.js';

export function initSnake() {
  const mid = Math.floor(state.gridSize / 2);
  state.snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  state.direction = 'RIGHT';
  state.nextDirection = 'RIGHT';
  state.growthQueue = 0;
}

export function moveSnake() {
  const head = { ...state.snake[0] };
  if (state.direction === 'UP') head.y--;
  if (state.direction === 'DOWN') head.y++;
  if (state.direction === 'LEFT') head.x--;
  if (state.direction === 'RIGHT') head.x++;
  state.snake.unshift(head);
  if (state.growthQueue > 0) {
    state.growthQueue--;
  } else {
    state.snake.pop();
  }
}

export function growSnake(amount = 1) {
  state.growthQueue += amount;
}
