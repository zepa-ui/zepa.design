"use client";

import { GsapImageTrail } from "./ui";

const LOGO_URL =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png";

const TRAIL_IMAGES = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/01_wvqrxz.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/02_efyml3.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/03_sceom4.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/04_dpquqc.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/05_ccn9so.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/06_p0lonf.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/07_wzzq5u.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/08_bu1urh.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/09_b5kt8t.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/10_yhg5ej.png",
];

export default function DropsHero() {
  return (
    <GsapImageTrail images={TRAIL_IMAGES}>
      <img
        src={LOGO_URL}
        alt="Zepa"
        draggable={false}
        className="mb-[min(16px,2vw)] h-[min(52px,6.5vw)] w-auto"
      />
      <span>Move your mouse to make</span>
      <span className="text-[#999]">images fall and bounce</span>
    </GsapImageTrail>
  );
}
