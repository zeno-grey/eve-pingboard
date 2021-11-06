export function RegionLink(props: { region: string, system?: string }): JSX.Element {
  const link = `https://evemaps.dotlan.net/map/${props.region.replaceAll(' ', '_')}` +
    (props.system ? `/${props.system.replaceAll(' ', '_')}` : '')

  return (
    <a href={link} target="_blank" rel="noreferrer">
      {props.region}
    </a>
  )
}
