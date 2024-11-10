import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

export const NAN = NaN.toString()

export const getHeader = (
  request: Request,
  key: string,
  default_value: string = ''
): string => {
  return request.headers.get(key) ?? default_value
}

export const getParams = (
  request: Request,
  key: string,
  default_value: string = ''
) => {
  return new URL(request.url).searchParams.get(key) ?? default_value
}

export const getBody = async <T>(request: Request) => {
  try {
    return (await request.json()) as T
  } catch {
    throw new Error('Invalid JSON or missing body')
  }
}

dayjs.extend(utc)
dayjs.extend(timezone)

export const CURRENT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

export const convertTimezone = (date: Date, timezone: string) => {
  console.debug(
    CURRENT_TIMEZONE,
    timezone,
    dayjs.tz(date, timezone).format(),
    dayjs(date).tz(timezone).unix()
  )
  return dayjs(date).tz(timezone).format()
}
