"use client";
import { getAnimeById } from "./API/apiCall";

function handleGetAnime() {
  getAnimeById(1).then((data) => {
    console.log(data);
  });
}
export default function Home() {
  return (

    <main className="flex h-screen">
      <div className="left-side flex-1 bg-red-500 hover:bg-red-400">
        <button onClick={handleGetAnime} >Get anime</button>
      </div>
      <div className="right-side flex-1 bg-green-500 hover:bg-green-400"></div>
    </main>

  );
}
