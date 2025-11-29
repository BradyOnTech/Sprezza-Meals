import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      <h1>Sprezza Storefront (Next.js)</h1>
      <p>
        This is a placeholder landing page. We will wire it to Payload REST/GraphQL for meals,
        customization options, meal plans, and CMS content.
      </p>
      <ul>
        <li>Catalog data: fetched from Payload collections.</li>
        <li>Auth/checkout: Supabase auth + Stripe payments via Next route handlers.</li>
        <li>Admin: Payload at <code>payload/</code> service.</li>
      </ul>
      <p>
        Next steps: add data clients, shared types, and wire the Meal listing/detail/custom builder
        to Payload endpoints.
      </p>
      <p>
        Visit the Payload admin once running:{' '}
        <Link href="http://localhost:4000/admin">http://localhost:4000/admin</Link>
      </p>
    </main>
  );
}
