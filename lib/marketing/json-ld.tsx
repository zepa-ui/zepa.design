/**
 * Renders a schema.org JSON-LD script tag. Server component — no client JS.
 * Usage: <JsonLd data={organizationSchema()} />
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
