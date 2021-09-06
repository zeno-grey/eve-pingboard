export function RegionLink(props: { region: string, system?: string }): JSX.Element {
  const link = `https://evemaps.dotlan.net/map/${props.region}` +
    (props.system ? `/${props.system}` : '')

  return (
    <a href={link} target="_blank" rel="noreferrer">
      {props.region}
    </a>
  )
}
