"use client";

import { useEffect, useRef, useState } from "react";
import { getGestureFromLandmarks } from "../utils/gestureUtils";

type Move = "STONE" | "PAPER" | "SCISSORS" | "";

const MOVES: Move[] = ["STONE", "PAPER", "SCISSORS"];

export default function HandGame() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 🔒 Frame-level lock (MOST IMPORTANT FIX)
  const roundLockedRef = useRef(true);

  const [playerMove, setPlayerMove] = useState<Move>("");
  const [computerMove, setComputerMove] = useState<Move>("");
  const [result, setResult] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);

  const [countdown, setCountdown] = useState(3);
  const [canPlay, setCanPlay] = useState(false);

  // ⏱️ Countdown between rounds
  useEffect(() => {
    roundLockedRef.current = true;
    setCanPlay(false);
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          roundLockedRef.current = false; // 🔓 unlock exactly once
          setCanPlay(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playerScore, computerScore]);

  // 🎥 MediaPipe setup
  useEffect(() => {
    if (!videoRef.current) return;

    const Hands = require("@mediapipe/hands").Hands;
    const Camera = require("@mediapipe/camera_utils").Camera;

    const hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results: any) => {
      // 🚫 Ignore frames if round already played
      if (roundLockedRef.current) return;
      if (!results.multiHandLandmarks?.length) return;

      const gesture = getGestureFromLandmarks(
        results.multiHandLandmarks[0]
      );

      if (gesture !== "UNKNOWN") {
        roundLockedRef.current = true; // 🔒 lock instantly
        playGame(gesture as Move);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (!videoRef.current) return;
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => camera.stop();
  }, []);

  // 🎮 Game logic
  function playGame(player: Move) {
    const computer =
      MOVES[Math.floor(Math.random() * MOVES.length)];

    setPlayerMove(player);
    setComputerMove(computer);

    if (player === computer) {
      setResult("DRAW 🤝");
    } else if (
      (player === "STONE" && computer === "SCISSORS") ||
      (player === "PAPER" && computer === "STONE") ||
      (player === "SCISSORS" && computer === "PAPER")
    ) {
      setResult("YOU WIN 🎉");
      setPlayerScore((s) => s + 1);
    } else {
      setResult("YOU LOSE 😢");
      setComputerScore((s) => s + 1);
    }
  }

  function resetGame() {
    roundLockedRef.current = true;
    setPlayerMove("");
    setComputerMove("");
    setResult("");
    setPlayerScore(0);
    setComputerScore(0);
    setCountdown(3);
    setCanPlay(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg border"
        />

        {!canPlay && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <span className="text-white text-6xl font-bold">
              {countdown}
            </span>
          </div>
        )}
      </div>

      <div className="text-center">
        <p>🧍 You: {playerMove || "-"}</p>
        <p>💻 Computer: {computerMove || "-"}</p>
        <h2 className="text-xl font-bold mt-2">{result}</h2>
      </div>

      <p className="font-semibold">
        Score → You: {playerScore} | Computer: {computerScore}
      </p>

      <button
        onClick={resetGame}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Reset Game
      </button>
    </div>
  );
}