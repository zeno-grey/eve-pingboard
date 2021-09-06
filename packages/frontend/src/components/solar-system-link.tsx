export function SolarSystemLink(props: { system: string }): JSX.Element {
  const link = `https://evemaps.dotlan.net/system/${props.system}`
  return (
    <a href={link} target="_blank" rel="noreferrer">
      {props.system}
    </a>
  )
}
