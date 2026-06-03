import { GamepadButtonMap, type ButtonName } from './buttons.ts';

export function clickOnGamepad(buttonName: ButtonName, padIndex: number = 0) {
  const pad = navigator.getGamepads()[padIndex];
}
