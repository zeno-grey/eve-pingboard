import clsx from 'clsx'
import { Col, Form, Row } from 'react-bootstrap'
import { DateTimeInput } from './date-time-input'
import { RelativeTimeInput } from './relative-time-input'
import {
  AbsoluteOrRelativeTime,
  useAbsoluteRelativeTimeInput,
} from '../hooks/use-absolute-relative-time-input'

export interface PingTimeInputProps {
  allowPast?: boolean
  time: AbsoluteOrRelativeTime
  onChange: (newTime: AbsoluteOrRelativeTime) => void
}
export function PingTimeInput({
  allowPast: allowPast = false,
  time,
  onChange,
}: PingTimeInputProps): JSX.Element {
  const input = useAbsoluteRelativeTimeInput({ time, onChange, allowPast: allowPast })

  return (
    <Row className="me-0">
      <Form.Group as={Col} controlId="eveDateTime" xs={12} lg={6} className="pe-0">
        <Form.Label>
          <Form.Check
            inline
            label="Use EVE Time (UTC)"
            name="eveDateTimeMode"
            type="radio"
            onChange={() => input.handleChangeInputMode('absolute')}
            id="absolute"
            checked={input.inputMode === 'absolute'}
          />
        </Form.Label>
        <DateTimeInput
          allowPast={allowPast}
          value={input.absoluteTime}
          onChange={input.handleAbsoluteDateChange}
          className={clsx(
            'time-mode-input',
            input.inputMode !== 'absolute' && 'inactive-time-mode')}
        />
      </Form.Group>

      <Form.Group as={Col} controlId="relativeTime" xs={12} lg={6} className="mb-3 me-0">
        <Form.Label>
          <Form.Check
            inline
            label="Use Relative Time"
            name="eveDateTimeMode"
            type="radio"
            onChange={() => input.handleChangeInputMode('relative')}
            id="relative"
            checked={input.inputMode === 'relative'}
          />
        </Form.Label>
        <RelativeTimeInput
          value={input.relativeTime}
          onChange={input.handleRelativeDateChange}
          className={clsx(
            'me-n4',
            'time-mode-input',
            input.inputMode !== 'relative' && 'inactive-time-mode'
          )}
        />
      </Form.Group>
    </Row>
  )
}
