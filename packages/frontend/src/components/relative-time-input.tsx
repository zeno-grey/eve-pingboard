import { useEffect } from 'react'
import { useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { dayjs, Duration, DurationUnitsObjectType } from '../utils/dayjs'

interface DurationComponent {
  label: string
  unit: keyof DurationUnitsObjectType
  format: string | ((duration: Duration) => string | number)
}
const defaultDurationComponents: DurationComponent[] = [
  { label: 'Days', unit: 'days', format: dur => dur.asDays() | 0 },
  { label: 'Hours', unit: 'hours', format: 'HH' },
  { label: 'Minutes', unit: 'minutes', format: 'mm' },
]

export interface RelativeTimeInputProps {
  value: Duration
  onChange: (value: Duration) => void
  durationComponents?: DurationComponent[]
}
export function RelativeTimeInput({
  value: duration,
  onChange,
  durationComponents = defaultDurationComponents,
}: RelativeTimeInputProps): JSX.Element {
  const durationFromTexts = (texts: string[]) => dayjs.duration(Object.fromEntries(
    durationComponents.map(({ unit }, i) => {
      const value = parseInt(texts[i], 10)
      return [unit, isFinite(value) ? value : 0]
    })
  ))
  const textsFromDuration = (duration: Duration) => durationComponents
    .map(({ format }) => typeof format === 'function'
      ? `${format(duration)}`
      : dayjs.duration(duration.asMilliseconds(), 'milliseconds').format(format)
    )

  const [inputTexts, setInputTexts] = useState(textsFromDuration(duration))

  useEffect(() => {
    const inputDuration = textsFromDuration(durationFromTexts(inputTexts))
    const propDuration = textsFromDuration(duration)
    if (inputDuration.some((c, i) => c !== propDuration[i])) {
      setInputTexts(textsFromDuration(duration))
    }
  // We only want to run this when the duration prop changes, not when the input fields change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration])

  const handleInputTextChange = (index: number, text: string) => {
    const newTexts = inputTexts.map((t, i) => i === index ? text : t)
    setInputTexts(newTexts)
    onChange(durationFromTexts(newTexts))
  }

  /** Update the input field values when they lose focus */
  const handleBlur = () => {
    setInputTexts(textsFromDuration(duration))
  }

  return (
    <Row>
      {durationComponents.map(({ label }, i) => (
        <Form.Group key={label} as={Col} xs={12 / durationComponents.length}>
          <Form.Label>{label}</Form.Label>
          <Form.Control
            type="number"
            pattern="^-?[0-9]*$"
            value={inputTexts[i]}
            onChange={e => handleInputTextChange(i, e.target.value)}
            onBlur={handleBlur}
          />
        </Form.Group>
      ))}
    </Row>
  )
}
