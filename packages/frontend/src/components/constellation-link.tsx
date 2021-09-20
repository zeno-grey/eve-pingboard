export function ConstellationLink(props: { region: string, constellation: string }): JSX.Element {
  const link = `https://evemaps.dotlan.net/map/${props.region}/${props.constellation}`

  return (
    <a href={link} target="_blank" rel="noreferrer">
      {props.constellation}
    </a>
  )
}
