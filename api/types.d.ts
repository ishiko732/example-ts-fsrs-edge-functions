import { FSRSParameters, FSRSHistory, State, RatingType } from 'ts-fsrs'

export type TCard = {
  card_id?: string // Card ID
  due: string // Due date
  stability: number // Stability
  difficulty: number // Difficulty level
  elapsed_days: number // Number of days elapsed
  scheduled_days: number // Number of days scheduled
  reps: number // Repetition count
  lapses: number // Number of lapses or mistakes
  state: State // Card's state (New, Learning, Review, Relearning)
  last_review?: string // Date of the last review (optional)
}

export type TReviewLog = {
  card_id?: string // Card ID
  rating: number // Rating of the review (Again, Hard, Good, Easy)
  state: number // State of the review (New, Learning, Review, Relearning)
  due: string // Date of the last scheduling
  stability: number // Memory stability during the review
  difficulty: number // Difficulty of the card during the review
  elapsed_days: number // Number of days elapsed since the last review
  last_elapsed_days: number // Number of days between the last two reviews
  scheduled_days: number // Number of days until the next review
  review: string // Date of the review
}

export type GradeType = Exclude<RatingType, 'Manual'>

export type TRecordLogItem = {
  card: TCard
  log: TReviewLog
}

export type TRecordLog = Record<GradeType, TRecordLogItem>

export type TBody<T> = {
  data: T
  parameters?: FSRSParameters
}

export type TRescheduler = {
  current_card: TCard
  history: FSRSHistory[]
  first_card: TCard
}
