"use client";

import { useRef } from "react";
import { DotLottieReact, DotLottie } from "@lottiefiles/dotlottie-react";

export function useGlassesMarker() {
  const dotLottieRef = useRef<DotLottie | null>(null);
  const hasPlayedReveal = useRef(false);

  function handleDotLottieRef(instance: DotLottie) {
    dotLottieRef.current = instance;
  }

  function playReveal() {
    const dl = dotLottieRef.current;
    if (!dl || hasPlayedReveal.current) return;
    hasPlayedReveal.current = true;

    // "in-reveal" marker runs frames 0-70; "default:hover-searching" runs 70-202.5 (looped).
    dl.setLoop(false);
    dl.setSegment(0, 70);
    dl.play();

    dl.addEventListener("complete", function onComplete() {
      dl.removeEventListener("complete", onComplete);
      dl.setLoop(true);
      dl.setSegment(70, 202);
      dl.play();
    });
  }

  return {
    onEnter: playReveal,
    element: (
      <div className="w-24 h-24 opacity-90">
        <DotLottieReact
          src="/lottie/glasses.json"
          autoplay={false}
          loop={false}
          dotLottieRefCallback={handleDotLottieRef}
        />
      </div>
    ),
  };
}

