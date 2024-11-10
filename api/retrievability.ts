import { fsrs } from 'ts-fsrs'
import { getParams, getBody, NAN } from './_common'
import { TBody, TCard } from './types'
export const config = {
  runtime: 'edge'
}

/**
 * Handles the POST request to calculate the retrievability of a card.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - The response containing the retrievability information.
 *
 * The request should contain the following parameters:
 * - `now`: The current timestamp in seconds (optional).
 * - `card_id`: The ID of the card (optional).
 *
 * The request body should contain:
 * - `data`: The card data.
 * - `parameters`: The parameters for the FSRS function.
 *
 * The response will contain:
 * - `card_id`: The ID of the card (if provided).
 * - `retrievability`: The calculated retrievability of the card.
 * - `retrievability_string`: The retrievability as a percentage string.
 * - `now`: The current timestamp in milliseconds.
 *
 * The response headers will include:
 * - `content-type`: Set to `application/json`.
 * - `x-now`: The current timestamp in milliseconds.
 * - `x-vercel-region`: The Vercel region (if available).
 */
export async function POST(request: Request) {
  const raw_current_mills = Number(getParams(request, 'now', NAN)) // seconds timestamp
  const now = Number.isFinite(raw_current_mills)
    ? raw_current_mills * 1000
    : new Date().valueOf()
  const card_id = getParams(request, 'card_id')
  const { data: card, parameters: params } = await getBody<TBody<TCard>>(
    request
  )
  if (!card) {
    return new Response('Invalid card, request field : data', {
      status: 400,
      statusText: 'Bad Request'
    })
  }
  console.debug('card', card)
  const f = fsrs(params)
  const retrievability = f.get_retrievability(card, now, false)

  return new Response(
    JSON.stringify({
      card_id: card_id || undefined,
      retrievability: retrievability,
      retrievability_string: `${(retrievability * 100).toFixed(2)}%`,
      now: now
    }),
    {
      headers: {
        'content-type': 'application/json',
        'x-now': now.toString(),
        'x-vercel-region': process.env.VERCEL_REGION || 'unknown'
      }
    }
  )
}
