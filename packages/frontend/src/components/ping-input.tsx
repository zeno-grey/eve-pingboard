import { MouseEvent, useRef } from 'react'
import { Alert, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { PingPlaceholder } from '../hooks/use-ping-placeholders'

export interface PingInputProps {
  placeholders?: PingPlaceholder[]
  value: string
  onChange: (newValue: string) => void
}
export function PingInput({
  placeholders = [],
  value,
  onChange,
}: PingInputProps): JSX.Element {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const insertPlaceholder = (placeholder: string) => (e: MouseEvent) => {
    e.preventDefault()
    if (!inputRef.current || !value) { return }
    const { selectionStart, selectionEnd } = inputRef.current
    const newText = [
      value.substring(0, selectionStart),
      `{{${placeholder}}}`,
      value.substring(selectionEnd),
    ].join('')
    onChange(newText)
    setTimeout(() => {
      // + 4 because of the curly braces (`{{placeholder}}`)
      const newSelection = selectionStart + placeholder.length + 4
      inputRef.current?.setSelectionRange(newSelection, newSelection)
    })
  }

  return (<>
    <Form.Label>Ping Text:</Form.Label>

    {placeholders.length > 0 && (
      <Alert variant="info" className="py-1">
        <i className="bi-info-circle" />{' '}
        There are a few placeholders available that will be replaced when sending the ping:
        <ul className="mb-0">
          {placeholders.map(({ placeholder, description }) => (
            <li key={placeholder}>
              <OverlayTrigger
                placement="bottom"
                delay={{ show: 250, hide: 0 }}
                overlay={
                  <Tooltip>
                    Click to insert the placeholder at the cursor position
                  </Tooltip>
                }
              >
                <code onMouseDown={insertPlaceholder(placeholder)} role="button">
                  {`{{${placeholder}}}`}
                </code>
              </OverlayTrigger> → {description}
            </li>
          ))}
        </ul>
      </Alert>
    )}

    <Form.Control ref={inputRef}
      as="textarea"
      className="ping-text flex-grow-1 overflow-auto"
      style={{ height: '300px' }}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </>)
}
