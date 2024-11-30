import { fsrs, GenSeedStrategyWithCardId, StrategyMode } from 'ts-fsrs'
import { getHeader, CURRENT_TIMEZONE, getParams, NAN, getBody } from './_common'
import { recordItemHandler } from './_handlers'
import { TBody, TRescheduler } from './types'

export const config = {
  runtime: 'edge'
}

/**
 * Handles the POST request to reschedule a card.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - The response object containing the rescheduled card data.
 *
 */
export async function POST(request: Request) {
  const timezone = getHeader(request, 'x-timezone', CURRENT_TIMEZONE)
  const raw_current_mills = Number(getParams(request, 'now', NAN)) // seconds timestamp
  const now = Number.isFinite(raw_current_mills)
    ? raw_current_mills * 1000
    : new Date().valueOf()
  const { data, parameters: params } = await getBody<TBody<TRescheduler>>(
    request
  )
  if (!data) {
    return new Response('Invalid data, request field : data', {
      status: 400,
      statusText: 'Bad Request'
    })
  }
  console.debug('card', data)
  const card_id = getParams(request, 'card_id')
  const skip_manual = Boolean(getParams(request, 'skip_manual'))
  const memory_state = Boolean(getParams(request, 'memory_state'))
  console.debug('card_id', card_id)
  console.debug('skip_manual', skip_manual)
  console.debug('memory_state', memory_state)

  // reschedule the card
  const seedStrategyWithCardId = GenSeedStrategyWithCardId('card_id')
  const f = fsrs(params).useStrategy(StrategyMode.SEED, seedStrategyWithCardId)
  const { current_card, first_card, history } = data

  const handler = recordItemHandler.bind(null, card_id, timezone)
  const rescheduler = f.reschedule(current_card, history, {
    recordLogHandler: handler,
    reviewsOrderBy: undefined,
    skipManual: skip_manual,
    update_memory_state: memory_state,
    now: now,
    first_card: first_card
  })

  return new Response(JSON.stringify(rescheduler), {
    headers: {
      'content-type': 'application/json',
      'x-timezone': timezone,
      'x-now': now.toString(),
      'x-vercel-region': process.env.VERCEL_REGION || 'unknown'
    }
  })
}
