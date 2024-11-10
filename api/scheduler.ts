import { fsrs, Grade, TypeConvert } from 'ts-fsrs'
import { getHeader, getParams, getBody, NAN, CURRENT_TIMEZONE } from './_common'
import { TBody, TCard, TRecordLog, TRecordLogItem } from './types'
import { cardHandler, recordHandler, recordItemHandler } from './_handlers'

export const config = {
  runtime: 'edge'
}

/**
 * Handles the POST request to schedule or repeat a card.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - The response object containing the scheduling result.
 */
export async function POST(request: Request) {
  const timezone = getHeader(request, 'x-timezone', CURRENT_TIMEZONE)
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
  const grade = getParams(request, 'grade')

  // repeat the card
  const f = fsrs(params)

  let scheduler: TRecordLog | TRecordLogItem
  if (grade) {
    const handler = recordItemHandler.bind(null, card_id, timezone)
    scheduler = f.next<TRecordLogItem>(
      card,
      now,
      TypeConvert.rating(grade) as Grade,
      handler
    )
  } else {
    const handler = recordHandler.bind(null, card_id, timezone)
    scheduler = f.repeat<TRecordLog>(card, now, handler)
    // rescheduler[grade] = f.next(card, now, TypeConvert.rating(grade) as Grade, recordItemHandler)
  }

  return new Response(JSON.stringify(scheduler), {
    headers: {
      'content-type': 'application/json',
      'x-timezone': timezone,
      'x-now': now.toString(),
      'x-vercel-region': process.env.VERCEL_REGION || 'unknown'
    }
  })
}

/**
 * rollback the card.
 *
 * @throws {Response} - If the record log item is invalid, returns a 400 Bad Request response.
 */
export async function PUT(request: Request) {
  const timezone = getHeader(request, 'x-timezone', CURRENT_TIMEZONE)
  const raw_current_mills = Number(getParams(request, 'now', NAN)) // seconds timestamp
  const now = Number.isFinite(raw_current_mills)
    ? raw_current_mills * 1000
    : new Date().valueOf()
  const card_id = getParams(request, 'card_id')
  const { data: item, parameters: params } = await getBody<
    TBody<TRecordLogItem>
  >(request)
  if (!item) {
    return new Response('Invalid record log item, request field : data', {
      status: 400,
      statusText: 'Bad Request'
    })
  }

  // rollback
  const { card, log } = item
  const f = fsrs(params)

  const handler = cardHandler.bind(null, card_id, timezone)
  const rollbackItem = f.rollback(card, log, handler)

  return new Response(JSON.stringify(rollbackItem), {
    headers: {
      'content-type': 'application/json',
      'x-timezone': timezone,
      'x-now': now.toString(),
      'x-vercel-region': process.env.VERCEL_REGION || 'unknown'
    }
  })
}

/**
 * forget the card.
 *
 * @throws {Response} - If the card is invalid, returns a 400 Bad Request response.
 */
export async function DELETE(request: Request) {
  const timezone = getHeader(request, 'x-timezone', CURRENT_TIMEZONE)
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

  // forget
  const reset_count = Boolean(getParams(request, 'reset_count'))
  const f = fsrs(params)

  const handler = recordItemHandler.bind(null, card_id, timezone)
  const forgetItem = f.forget(card, now, reset_count, handler)

  return new Response(JSON.stringify(forgetItem), {
    headers: {
      'content-type': 'application/json',
      'x-timezone': timezone,
      'x-now': now.toString(),
      'x-vercel-region': process.env.VERCEL_REGION || 'unknown'
    }
  })
}
