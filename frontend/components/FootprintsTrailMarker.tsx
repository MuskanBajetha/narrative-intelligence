"use client";

import { useRef } from "react";
import { DotLottieReact, DotLottie } from "@lottiefiles/dotlottie-react";

export function useFootprintsMarker() {
  const dotLottieRef = useRef<DotLottie | null>(null);
  const hasPlayed = useRef(false);

  function handleRef(instance: DotLottie) {
    dotLottieRef.current = instance;
  }

  function playOnce() {
    if (hasPlayed.current) return;
    hasPlayed.current = true;
    dotLottieRef.current?.setLoop(true);
    dotLottieRef.current?.play();
  }

  const element = (
    <div className="w-96 h-60 opacity-80">
      <DotLottieReact
        src="https://lottie.host/fb810a36-94e4-4597-811f-a5f6a1de83a8/pcvtvip9t5.lottie"
        autoplay
        loop
        dotLottieRefCallback={handleRef}
      />
    </div>
  );

  return { onEnter: playOnce, element };
}