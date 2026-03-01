/**
 * Help Onboarding - Returns onboarding guides for Help/About page.
 * Public endpoint; returns static or DB-sourced guides.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STATIC_GUIDES = [
  {
    id: 'ob-seller',
    title: 'Seller Onboarding',
    role: 'seller',
    steps: [
      'Create an account and verify your email',
      'Complete KYC verification (identity and business)',
      'Add your first listing with photos and details',
      'Submit for AI QA and ops review',
      'Once approved, set your auction schedule',
      'Manage inspections and close the sale',
    ],
  },
  {
    id: 'ob-buyer',
    title: 'Buyer Onboarding',
    role: 'buyer',
    steps: [
      'Create an account and verify your email',
      'Complete KYC verification if required for your plan',
      'Browse the marketplace and add items to your watchlist',
      'Place bids during live auctions',
      'Complete checkout and payment after winning',
      'Schedule inspections and arrange logistics',
    ],
  },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    return new Response(JSON.stringify({ guides: STATIC_GUIDES }), {
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
