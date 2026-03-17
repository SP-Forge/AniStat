"use client";
import dynamic from "next/dynamic";

const CardBattleApp = dynamic(() => import("./App.jsx"), { ssr: false });

export default function CardBattleClient() {
  return <CardBattleApp />;
}
