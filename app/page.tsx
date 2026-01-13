import HandGame from "./components/HandGame";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Ayush&apos;s Stone Paper Scissors 🎮
      </h1>

      <HandGame />

      <p className="mt-6 text-sm text-gray-600 text-center">
        Show ✊ ✋ ✌️ gestures in front of the camera to play
      </p>
    </main>
  );
}