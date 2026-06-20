"use client";

import { TelescopeZoom } from "./ui/telescope-zoom";

const CLOUDINARY = "https://res.cloudinary.com/dzvffb6vv/image/upload";

const smallImages = [
  `${CLOUDINARY}/q_auto/f_auto/v1781974826/img-1_mbyqyl.webp`,
  `${CLOUDINARY}/q_auto/f_auto/v1781974825/img-2_v5gq1x.webp`,
  `${CLOUDINARY}/q_auto/f_auto/v1781974826/img-3_br5mmk.webp`,
  `${CLOUDINARY}/q_auto/f_auto/v1781974826/img-4_qu6xye.webp`,
  `${CLOUDINARY}/q_auto/f_auto/v1781974826/img-5_bgtjze.webp`,
  `${CLOUDINARY}/q_auto/f_auto/v1781974826/img-6_hkyexk.webp`,
  `${CLOUDINARY}/q_auto/f_auto/v1781974826/img-7_rj1rrl.webp`,
  `${CLOUDINARY}/q_auto/f_auto/v1781974827/img-8_xf0aym.webp`,
  `${CLOUDINARY}/q_auto/f_auto/v1781974827/img-9_lukfik.webp`,
  `${CLOUDINARY}/q_auto/f_auto/v1781974827/img-10_ngdkia.webp`,
];

export default function Demo() {
  return (
    <TelescopeZoom
      bigImage={`${CLOUDINARY}/v1781974827/img-big_zk9isw.jpg`}
      maskImage={`${CLOUDINARY}/v1781974827/mask_osn20b.png`}
      smallImages={smallImages}
      heading={{ left: "for the", right: "planet" }}
    />
  );
}
