import React from 'react'

const slackFormatters: { regex: RegExp, onMatch: (...match: string[]) => React.ReactNode }[] = [
  // newlines
  { regex: /\n/g, onMatch: _ => <br /> }, // eslint-disable-line @typescript-eslint/no-unused-vars
  // links (`[title](url)`)
  {
    regex: /\[([^\]]+\]\([^)]+)\)>/g,
    onMatch: match => {
      const split = match.indexOf('](')
      const href = match.substring(0, split)
      const title = match.substring(split + 2)
      return <a href={href} target="_blank" rel="noreferrer">{title}</a>
    },
  },
  // links (`<href|title>`)
  {
    regex: /<([^|]+\|[^>]+)>/g,
    onMatch: match => {
      const split = match.indexOf('|')
      const href = match.substring(0, split)
      const title = match.substring(split + 1)
      return <a href={href} target="_blank" rel="noreferrer">{title}</a>
    },
  },
  // bold text
  { regex: /\*([^*]+)\*/g, onMatch: match => <b>{match}</b> },
  // italics
  { regex: /_([^*]+)_/g, onMatch: match => <i>{match}</i> },
  // strikethrough
  { regex: /~([^~]+)~/g, onMatch: match => <s>{match}</s> },
]

export function SlackMessage({ text }: { text: string }): JSX.Element {
  const fragments = slackFormatters.reduce(
    (fragments, { regex, onMatch }) => fragments.flatMap(fragment => {
      if (typeof fragment !== 'string') {
        return [fragment]
      }
      const placeholder = '\0'
      const replacements: React.ReactNode[] = []
      const formatted = fragment.replace(regex, (...args) => {
        const match = args.length > 3 ? args.slice(1, args.length - 2) as string[] : []
        replacements.push(onMatch(...match))
        return placeholder
      })
      return formatted
        .split(placeholder)
        .flatMap((f, i) => [f, ...replacements[i] ? [replacements[i]] : []])
    }),
    [text] as React.ReactNode[]
  )

  return (<>
    {fragments.map((f, i) => <React.Fragment key={i}>{f}</React.Fragment>)}
  </>)
}
