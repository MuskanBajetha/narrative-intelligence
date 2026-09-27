"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { DotLottieReact, DotLottie } from "@lottiefiles/dotlottie-react";

interface Segment {
  reveal: [number, number]; // [start, end] frame range for the one-shot intro
  loop: [number, number];   // [start, end] frame range that repeats after
}

export function useLottieTrailMarker(src: string, segments: Segment) {
  const dotLottieRef = useRef<DotLottie | null>(null);
  const isReady = useRef(false);
  const pendingPlay = useRef(false);
  const hasTriggered = useRef(false); // NEW: Prevents timeline restarts if scrolling back & forth
  const [key, setKey] = useState(0);

  // FIX: Store your segments securely inside a mutable ref object. 
  // This keeps the frames perfect without breaking your useCallback memory signatures.
  const segmentsRef = useRef(segments);
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  const runRevealThenLoop = useCallback(() => {
    const dl = dotLottieRef.current;
    if (!dl || hasTriggered.current) return;
    hasTriggered.current = true; // Lock playback intent immediately

    const currentSegments = segmentsRef.current;

    // Phase 1: One-shot reveal animation
    dl.setLoop(false);
    dl.setSegment(currentSegments.reveal[0], currentSegments.reveal[1]);
    dl.play();

    // Setup event listener to switch seamlessly to the loop segment once complete
    const onComplete = () => {
      dl.removeEventListener("complete", onComplete);
      dl.setLoop(true);
      dl.setSegment(currentSegments.loop[0], currentSegments.loop[1]);
      dl.play();
    };
    dl.addEventListener("complete", onComplete);
  }, []); // Empty dependencies list means this identity function reference NEVER changes

  const handleRef = useCallback((instance: DotLottie | null) => {
    dotLottieRef.current = instance;

    if (!instance) return;

    // Listen safely for asset compilation online status
    instance.addEventListener("load", () => {
      isReady.current = true;

      if (pendingPlay.current) {
        pendingPlay.current = false;
        runRevealThenLoop();
      }
    });
  }, [runRevealThenLoop]);

  const onEnter = useCallback(() => {
    if (isReady.current) {
      runRevealThenLoop();
    } else {
      pendingPlay.current = true;
    }
  }, [runRevealThenLoop]);

  const element = (
    <div className="w-28 h-28">
      <DotLottieReact
        key={key}
        src={src}
        autoplay={false}
        loop={false}
        dotLottieRefCallback={handleRef}
      />
    </div>
  );

  return { onEnter, element };
}
