import HandGame from "./components/HandGame";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">

      {/* TOP TITLE */}
      <h1 className="main-title">
        Ayush&apos;s Stone Paper Scissors <span>🎮</span>
      </h1>

      {/* GAME */}
      <HandGame />

      {/* BOTTOM TEXT */}
      <p className="helper-text">
        Show ✊ ✋ ✌️ gestures in front of the camera to play
      </p>
    </main>
  );
}