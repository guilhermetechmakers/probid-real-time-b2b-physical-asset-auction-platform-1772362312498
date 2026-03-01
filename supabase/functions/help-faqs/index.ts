/**
 * Help FAQs - Returns FAQ items for Help/About page.
 * Public endpoint; returns static or DB-sourced FAQs.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STATIC_FAQS = [
  { id: 's1', question: 'How do I list an asset for auction?', answer: 'Create an account, complete KYC verification, then use the intake flow to add your asset with photos and details. Our AI will validate the listing before it goes live.', category: 'seller' },
  { id: 's2', question: 'What photo angles are required?', answer: 'We require 15–25 photos covering all angles per our checklist: front, rear, sides, interior, engine bay, VIN/identifier, and any damage or wear.', category: 'seller' },
  { id: 's3', question: 'How long does approval take?', answer: "Most listings are reviewed within 24–48 hours. You'll receive an email when your listing is approved or if changes are needed.", category: 'seller' },
  { id: 'b1', question: 'How do I place a bid?', answer: 'Browse the marketplace, select a listing, and click Bid. You can set a proxy bid to automatically increase up to your max. Bids are binding.', category: 'buyer' },
  { id: 'b2', question: 'What is a proxy bid?', answer: 'A proxy bid lets you set a maximum amount. The system will automatically outbid others in increments until your max is reached.', category: 'buyer' },
  { id: 'b3', question: 'When do I pay?', answer: "After winning, you'll complete checkout within the specified window. Deposits may be required. Full payment is due per the auction terms.", category: 'buyer' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    return new Response(JSON.stringify({ faqs: STATIC_FAQS }), {
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
