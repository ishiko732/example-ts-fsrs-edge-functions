import { createEmptyCard } from 'ts-fsrs'
import { getHeader, getParams, NAN, CURRENT_TIMEZONE } from './_common'
import { TCard } from './types'
import { cardHandler } from './_handlers'

export const config = {
  runtime: 'edge'
}

/**
 * Handles the POST request to create a new card.
 *
 * @param {Request} request - The incoming HTTP request object.
 * @returns {Promise<Response>} - A promise that resolves to the HTTP response object.
 *
 * The function extracts the timezone from the request headers and the card ID from the request parameters.
 * It also retrieves the current timestamp from the request parameters, defaulting to the current time if not provided.
 * A new card is created using the extracted information and returned in the response.
 *
 * Response headers include:
 * - 'content-type': 'application/json'
 * - 'x-timezone': The extracted timezone
 * - 'x-now': The current timestamp in milliseconds
 * - 'x-vercel-region': The Vercel region, defaulting to 'unknown' if not set
 *
 * The response status is set to 201 (Created).
 */
export async function POST(request: Request) {
  const timezone = getHeader(request, 'x-timezone', CURRENT_TIMEZONE)

  const card_id = getParams(request, 'card_id')

  const raw_current_mills = Number(getParams(request, 'now', NAN)) // seconds timestamp
  const now = Number.isFinite(raw_current_mills)
    ? raw_current_mills * 1000
    : new Date().valueOf()
  const handler = cardHandler.bind(null, card_id, timezone)
  const card = createEmptyCard<TCard>(now, handler)

  return new Response(JSON.stringify(card), {
    headers: {
      'content-type': 'application/json',
      'x-timezone': timezone,
      'x-now': now.toString(),
      'x-vercel-region': process.env.VERCEL_REGION || 'unknown'
    },
    status: 201,
    statusText: 'Created'
  })
}
