export type Gesture = "STONE" | "PAPER" | "SCISSORS" | "UNKNOWN";

/**
 * Converts MediaPipe hand landmarks into a game gesture
 * Logic:
 * - 0 fingers up  -> STONE
 * - 2 fingers up  -> SCISSORS
 * - 4 or 5 fingers up -> PAPER
 */
export function getGestureFromLandmarks(
  landmarks: any[]
): Gesture {
  if (!landmarks || landmarks.length === 0) return "UNKNOWN";

  // Landmark indexes for finger tips and bases (except thumb)
  const fingerTips = [8, 12, 16, 20];
  const fingerBases = [6, 10, 14, 18];

  let fingersUp = 0;

  for (let i = 0; i < fingerTips.length; i++) {
    const tipY = landmarks[fingerTips[i]].y;
    const baseY = landmarks[fingerBases[i]].y;

    // Finger is considered "up" if tip is above base
    if (tipY < baseY) {
      fingersUp++;
    }
  }

  if (fingersUp === 0) return "STONE";
  if (fingersUp === 2) return "SCISSORS";
  if (fingersUp >= 4) return "PAPER";

  return "UNKNOWN";
}