import { ChangeEvent, useEffect } from 'react'
import { useState } from 'react'
import { Col, Form, Row, RowProps } from 'react-bootstrap'
import { Dayjs, dayjs } from '../utils/dayjs'

export interface DateTimeInputProps extends Omit<RowProps, 'onChange'> {
  value: Date | string | Dayjs
  onChange: (date: Dayjs) => void
}
export function DateTimeInput({
  value: date,
  onChange,
  ...rowProps
}: DateTimeInputProps): JSX.Element {
  const dateFormat = 'YYYY-MM-DD'
  const timeFormat = 'HH:mm'
  const timeBaseDate = '1970-01-01' // Date used for HH:mm calculations

  const [dateInputText, setDateInputText] = useState('')
  const [timeInputText, setTimeInputText] = useState('')

  useEffect(() => {
    const propDateTime = dayjs.utc(date)

    const inputDateTime = dayjs.utc(`${dateInputText}T${timeInputText}`)
    if (!propDateTime.isSame(inputDateTime)) {
      setDateInputText(propDateTime.format(dateFormat))
      setTimeInputText(propDateTime.format(timeFormat))
    }
  // We only want to run this when the date prop changes, not when the input fields change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const parseDateTime = (date: string, time: string): Dayjs => {
    const d = dayjs.utc(date)
    const t = dayjs.duration(
      dayjs.utc(`${timeBaseDate}T${time}`).diff(dayjs.utc(timeBaseDate))
    )
    return d.add(t)
  }

  const handleDateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setDateInputText(value)

    const date = dayjs.utc(value)
    if (!date.isValid()) {
      return
    }
    const dateTime = parseDateTime(value, timeInputText)
    if (dateTime.isValid()) {
      onChange(dateTime)
    }
  }

  const handleTimeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setTimeInputText(value)

    const time = dayjs.utc(`${timeBaseDate}T${value}`)
    if (!time.isValid()) {
      return
    }
    const dateTime = parseDateTime(dateInputText, value)
    if (dateTime.isValid()) {
      onChange(dateTime)
    }
  }

  /** Update the input field values when they lose focus */
  const handleBlur = () => {
    let dateTime = parseDateTime(dateInputText, timeInputText)
    if (!dateTime.isValid()) {
      dateTime = dayjs(date)
    }
    setDateInputText(dateTime.format(dateFormat))
    setTimeInputText(dateTime.format(timeFormat))
  }

  return (
    <Row {...rowProps}>
      <Form.Group as={Col} controlId="date" xs={6} className="mb-3">
        <Form.Label className="text-nowrap">Date ({dateFormat})</Form.Label>
        <Form.Control
          type="date"
          value={dateInputText}
          pattern="^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
          onChange={handleDateInputChange}
          onBlur={handleBlur}
        />
      </Form.Group>
      <Form.Group as={Col} controlId="time" xs={6} className="mb-3">
        <Form.Label className="text-nowrap">Time ({timeFormat})</Form.Label>
        <Form.Control
          type="text"
          maxLength={5}
          pattern="^[0-9]{2}:[0-9]{2}$"
          value={timeInputText}
          onChange={handleTimeInputChange}
          onBlur={handleBlur}
        />
      </Form.Group>
    </Row>
  )
}
