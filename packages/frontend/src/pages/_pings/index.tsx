import { Navigate } from 'react-router-dom'

export function PingsIndex(): JSX.Element {
  return <Navigate to="send" replace />
}
