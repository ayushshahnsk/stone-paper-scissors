"use client";

import { useEffect, useRef, useState } from "react";
import { getGestureFromLandmarks } from "../utils/gestureUtils";

type Move = "STONE" | "PAPER" | "SCISSORS" | "";

const MOVES: Move[] = ["STONE", "PAPER", "SCISSORS"];

/* =========================
   🔊 ADDED: Audio play helper
   ========================= */
function playAudio(src: string) {
  const audio = new Audio(src);
  audio.play().catch(() => { });
}

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

  /* =========================
    📝 ADDED: Countdown word
    ========================= */
  const [countdownWord, setCountdownWord] = useState("");

  // ⏱️ Countdown between rounds
  useEffect(() => {
    roundLockedRef.current = true;
    setCanPlay(false);
    setCountdown(3);

    /* =========================
       📝 ADDED: Start with STONE
       🔧 FIX: delayed audio so browser allows it
       ========================= */
    setCountdownWord("STONE");
    setTimeout(() => {
      playAudio("/audio/stone.mp3");
    }, 5); // ⬅️ important delay

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 3) {
          setCountdownWord("PAPER");
          playAudio("/audio/paper.mp3");
          return 2;
        }

        if (prev === 2) {
          setCountdownWord("SCISSORS");
          playAudio("/audio/scissors.mp3");
          return 1;
        }

        if (prev === 1) {
          clearInterval(interval);
          roundLockedRef.current = false; // 🔓 unlock exactly once
          setCanPlay(true);
          setCountdownWord("");
          return 0;
        }

        return prev;
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

  // 🎮 Game logic (UNCHANGED)
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
    <div className="game-card">
      <div className="game-layout">
        {/* CAMERA */}
        <div className="camera-panel">
          <div className="camera-wrapper">
            <video ref={videoRef} autoPlay playsInline muted />

            {!canPlay && countdown > 0 && (
              <div className="countdown-overlay flex flex-col gap-2">
                <span className="countdown-text">{countdown}</span>

                {/* =========================
                    📝 ADDED: STONE / PAPER / SCISSORS text
                   ========================= */}
                <span className="text-xl font-bold tracking-widest">
                  {countdownWord}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="info-panel">
          <h1 className="game-title">Stone Paper Scissors 🎮</h1>

          <div className="moves-box">
            <p>🧍 <strong>You:</strong> {playerMove || "-"}</p>
            <p>💻 <strong>Computer:</strong> {computerMove || "-"}</p>
          </div>

          <h2 className="status-text">
            {result || "Make your move!"}
          </h2>

          <p className="score-text">
            You {playerScore} : {computerScore} Computer
          </p>

          <button onClick={resetGame}>Restart Game</button>
        </div>
      </div>
    </div>
  );
}