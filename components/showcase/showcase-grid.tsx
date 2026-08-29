"use client"

import { ComponentPreview } from "./component-preview"

interface ComponentItem {
  slug: string
  title: string
  preview?: string
  category?: string
}

interface ShowcaseGridProps {
  items: ComponentItem[]
}

export function ShowcaseGrid({ items }: ShowcaseGridProps) {
  return (
    /* four up from lg. At a fixed column count the only way to grow the
       tiles is to give back gutter, so the column gap is kept tight and the
       row gap carries the visual separation instead. */
    <div className="grid grid-cols-1 gap-x-3 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
      {items
        .filter((item) => item.preview)
        .map((item) => (
          <ComponentPreview
            key={item.slug}
            slug={item.slug}
            title={item.title}
            preview={item.preview!}
            category={item.category}
          />
        ))}
    </div>
  )
}
