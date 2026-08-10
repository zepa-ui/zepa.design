"use client"

import { ZepaFolder, type ZepaFolderFile } from "./ui/zepa-folder"

const PORTRAITS: ZepaFolderFile[] = [
  {
    id: "han",
    image:
      "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/han_chmdo4.jpg",
    title: "Han",
  },
  {
    id: "sam",
    image:
      "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/samevans_hf73xr.jpg",
    title: "Sam Evans",
  },
  {
    id: "vivek",
    image:
      "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/vivek_i01gjp.png",
    title: "Vivek",
  },
  {
    id: "yash",
    image:
      "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705173/yash_u2hx6k.png",
    title: "Yash",
  },
]

export default function ZepaFolderDemo() {
  return (
    <section
      className="relative flex w-full items-center justify-center bg-[#08080a] px-6 py-16 text-white"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <ZepaFolder
        variant="tile"
        title="Portraits"
        files={PORTRAITS}
        color="#4f7dff"
        size={200}
      />
    </section>
  )
}
