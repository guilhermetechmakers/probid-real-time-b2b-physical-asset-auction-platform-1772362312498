/**
 * Help Docs - Returns documentation links for Help/About page.
 * Public endpoint; returns static or DB-sourced docs.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STATIC_DOCS = [
  { id: '1', title: 'Intake Guide', description: 'How to submit assets for auction with photos and metadata.', url: '/how-it-works', type: 'internal' },
  { id: '2', title: 'Photo Angle Checklist', description: 'Required photo angles for asset listings.', url: '#', type: 'external' },
  { id: '3', title: 'AI QA Explained', description: 'How our AI validates listing quality.', url: '/how-it-works', type: 'internal' },
  { id: '4', title: 'Auction Rules', description: 'Bidding rules, reserves, and anti-sniping.', url: '/how-it-works', type: 'internal' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    return new Response(JSON.stringify({ docs: STATIC_DOCS }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
