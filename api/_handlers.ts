import {
  Card,
  Grade,
  Grades,
  IPreview,
  Rating,
  RecordLogItem,
  ReviewLog
} from 'ts-fsrs'
import { convertTimezone } from './_common'
import { GradeType, TCard, TRecordLog, TReviewLog } from './types'

/**
 * Handles the transformation of a card object by updating its `card_id` and converting
 * its `due` and `last_review` dates to the specified timezone.
 *
 * @param card_id - The unique identifier of the card. If not provided, the existing `card_id` of the card will be used.
 * @param timezone - The timezone to which the `due` and `last_review` dates should be converted.
 * @param card - The card object to be transformed.
 * @returns The transformed card object with updated `card_id` and converted `due` and `last_review` dates.
 */
export const cardHandler = (
  card_id: string,
  timezone: string,
  card: Card
): TCard => {
  return {
    ...card,
    card_id: card_id || Reflect.get(card, 'card_id'),
    due: convertTimezone(card.due, timezone),
    last_review: card.last_review
      ? convertTimezone(card.last_review, timezone)
      : undefined
  } as TCard
}

export const reviewLogHandler = (
  card_id: string,
  timezone: string,
  log: ReviewLog
): TReviewLog => {
  return {
    ...log,
    card_id: card_id || undefined,
    due: convertTimezone(log.due, timezone),
    review: convertTimezone(log.review, timezone)
  }
}

export const recordItemHandler = (
  card_id: string,
  timezone: string,
  item: RecordLogItem
) => {
  return {
    card: cardHandler(card_id, timezone, item.card),
    log: reviewLogHandler(card_id, timezone, item.log)
  }
}

export const recordHandler = (
  card_id: string,
  timezone: string,
  recordLog: IPreview
) => {
  let id = card_id
  return Grades.reduce((acc: TRecordLog, grade: Grade) => {
    const item = recordItemHandler(id, timezone, recordLog[grade])
    if (item.card.card_id) {
      id = item.card.card_id
    }
    acc[Rating[grade] as GradeType] = item
    return acc
  }, {} as TRecordLog)
}
