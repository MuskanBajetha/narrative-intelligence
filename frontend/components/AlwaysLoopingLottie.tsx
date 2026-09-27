"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type Props = {
  src: string;
  className?: string;
};

export function AlwaysLoopingLottie({
  src,
  className = "",
}: Props) {
  return (
    <div className={className}>
      <DotLottieReact
        src={src}
        autoplay
        loop
      />
    </div>
  );
}
