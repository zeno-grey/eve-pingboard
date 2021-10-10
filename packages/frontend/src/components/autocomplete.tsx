import clsx from 'clsx'
import Fuse from 'fuse.js'
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Form, FormControlProps, ListGroup } from 'react-bootstrap'
import { usePopper } from 'react-popper'

/* eslint-disable @typescript-eslint/no-explicit-any */
type ObjectPathImpl<T, K extends keyof T> =
  K extends string
  ? T[K] extends Record<string, any>
    ? | `${K}.${ObjectPathImpl<T[K], Exclude<keyof T[K], keyof Array<any>> & string>}`
      | `${K}.${Exclude<keyof T[K], keyof Array<any>> & string}`
    : never
  : never
type ObjectPath<T> = ObjectPathImpl<T, keyof T> | (string & keyof T)
/* eslint-enable @typescript-eslint/no-explicit-any */

interface AutocompleteOptionKeyObject<T> {
  name: ObjectPath<T> | ObjectPath<T>[]
  weight: number
}
export type AutocompleteOptionKey<T> =
  | AutocompleteOptionKeyObject<T>
  | ObjectPath<T>
  | ObjectPath<T>[]

type FormControlRestProps = Omit<FormControlProps, 'value' | 'onChange' | 'type'>
export interface AutocompleteProps<T> extends FormControlRestProps {
  options: T[]
  resultLimit?: number
  optionName: (option: T) => string
  loadingText?: React.ReactNode
  searchKeys: AutocompleteOptionKey<T>[]
  value: string | null
  onChange: (newValue: T | null) => void
  renderOption?: (option: T) => React.ReactNode
}
export function Autocomplete<T>({
  options,
  resultLimit,
  optionName,
  loadingText,
  searchKeys,
  value,
  onChange,
  renderOption = optionName,
  ...controlProps
}: AutocompleteProps<T>): JSX.Element {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Fuse.FuseResult<T>[]>([])
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)

  const [active, setActive] = useState(false)

  const fuse = useMemo(() => new Fuse(options, {
    keys: searchKeys,
    distance: 10,
    threshold: 0.3,
  }), [options, searchKeys])

  const updateSearch = useCallback((search: string) => {
    const newResults = fuse.search(search)
    if (typeof resultLimit === 'number') {
      setResults(newResults.slice(0, resultLimit))
    } else {
      setResults(newResults)
    }
    return newResults
  }, [fuse, resultLimit])

  useEffect(() => {
    if (!value) {
      setInput('')
      setResults([])
      setSelectedResultIndex(0)
      return
    }
    const newResults = updateSearch(value)
    const index = newResults.findIndex(r => optionName(r.item) === value)
    if (index >= 0) {
      setInput(optionName(newResults[index].item))
      setSelectedResultIndex(index)
    } else {
      setInput('')
      setSelectedResultIndex(0)
    }
  }, [value, fuse, optionName, updateSearch])

  const handleInputChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    updateSearch(e.target.value)
  }
  const handleFocus = () => {
    setActive(true)
  }
  const handleSelectResult = (result: T) => {
    const name = optionName(result)
    setInput(name)
    const newResults = updateSearch(name)
    const newResultIndex = newResults.findIndex(r => optionName(r.item) === name)
    setSelectedResultIndex(Math.max(newResultIndex, 0))
    onChange(result)

    setActive(false)
  }
  const handleBlur = () => {
    if (results.length > 0) {
      if (selectedResultIndex >= 0 && selectedResultIndex < results.length) {
        const option = results[selectedResultIndex].item
        handleSelectResult(option)
      }
    } else {
      setInput('')
      onChange(null)
    }
    setActive(false)
  }
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const diff = e.key === 'ArrowDown' ? 1 : -1
      const newIndex = Math.max(0, Math.min(results.length -1, selectedResultIndex + diff))
      setSelectedResultIndex(newIndex)
      if (results.length > 0) {
        setInput(optionName(results[newIndex].item))
      }
      e.preventDefault()
    } else if (e.key === 'Enter') {
      if (selectedResultIndex >= 0 && selectedResultIndex < results.length) {
        const selectedResult = results[selectedResultIndex].item
        handleSelectResult(selectedResult)
      }
    } else {
      setActive(true)
    }
  }
  const optionClickHandler = (option: T) => (e: MouseEvent) => {
    e.preventDefault()
    const selectedResultIndex = results.findIndex(r => r.item === option)
    const index = Math.max(0, Math.min(results.length - 1, selectedResultIndex))
    setSelectedResultIndex(index)
    if (results.length > 0) {
      setInput(optionName(option))
      handleSelectResult(option)
    }
  }

  const referenceElement = useRef<HTMLElement>(null)
  const popperElement = useRef<HTMLDivElement>(null)
  const [optionRef, setOptionRef] = useState<HTMLElement | null>(null)
  const getSetOptionRef = (isActive: boolean) =>
    !isActive ? () => {} : (ref: HTMLElement | null | undefined) => {
    if (ref && optionRef !== ref) {
      setOptionRef(ref)
      ref.scrollIntoView({ block: 'nearest' })
    }
  }

  const popper = usePopper(referenceElement.current, popperElement.current, {
    placement: 'bottom',
    modifiers: [{ name: 'flip' }],
  })

  return (
    <div className="position-relative">
      <Form.Control
        ref={referenceElement}
        type="text"
        value={input}
        onChange={handleInputChanged}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...controlProps}
      />
      <ListGroup ref={popperElement}
        className={clsx('shadow', 'w-100', !active && 'invisible')}
        style={{
          ...popper.styles.popper,
          maxHeight: '50vh',
          overflow: 'hidden auto',
          zIndex: 1000,
        }}
        {...popper.attributes.popper}
      >
        {loadingText
          ? <ListGroup.Item>{loadingText}</ListGroup.Item>
          : results.map((res, i) => (
            <ListGroup.Item
              key={optionName(res.item)}
              action
              tabIndex={-1}
              onMouseDown={e => e.preventDefault()}
              onClick={optionClickHandler(res.item)}
              ref={getSetOptionRef(i === selectedResultIndex)}
              active={i === selectedResultIndex}
            >
              {renderOption(res.item)}
            </ListGroup.Item>
          ))
        }
      </ListGroup>
    </div>
  )
}
