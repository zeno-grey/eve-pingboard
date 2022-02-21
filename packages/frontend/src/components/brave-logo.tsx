import logo from './brave-logo.svg'

export interface BraveLogoProps {
  width?: string | number
  height?: string | number
}
export function BraveLogo({
  width,
  height,
}: BraveLogoProps): JSX.Element {
  return (
    <img src={logo} alt="Logo" className="img-fluid" width={width} height={height} />
  )
}
