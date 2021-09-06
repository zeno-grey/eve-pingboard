import { ApiEventEntry } from '@ping-board/common'
import dayjs from 'dayjs'
import { Button, Table } from 'react-bootstrap'
import { RegionLink } from '../../components/region-link'
import { RelativeTime } from '../../components/relative-time'
import { SolarSystemLink } from '../../components/solar-system-link'
import { Time } from '../../components/time'

export interface EventsTableProps {
  showResultColumn?: boolean
  canEdit?: boolean
  onEdit?: (event: ApiEventEntry) => void
  events: ApiEventEntry[]
}
export function EventsTable({
  showResultColumn = false,
  canEdit = false,
  onEdit,
  events,
}: EventsTableProps): JSX.Element {
  return (
    <Table hover size="sm" variant="dark" responsive>
      <thead>
        <tr>
          <th>System</th>
          <th>Region</th>
          <th>Priority</th>
          <th>Structure</th>
          <th>Type</th>
          <th>Standing</th>
          <th>Relative Time</th>
          <th>Local Time</th>
          <th>EVE Time</th>
          {showResultColumn && <th>Result</th>}
          <th>Notes</th>
          {canEdit && <th>Action</th>}
        </tr>
      </thead>
      <tbody>
        {events.length === 0 && (
          <tr>
            <td colSpan={10 + (+showResultColumn) + (+canEdit)}>
              No Events
            </td>
          </tr>
        )}
        {events.map(event => (
          <tr key={event.id}>
            <th scope="row"><SolarSystemLink system={event.system} /></th>
            <td><RegionLink system={event.system} region={event.region} /></td>
            <td>{event.priority}</td>
            <td>{event.structure}</td>
            <td>{event.type}</td>
            <td>{event.standing}</td>
            <td><RelativeTime time={event.time} /></td>
            <td><Time time={event.time} /></td>
            <td><Time time={dayjs(event.time).utc()} format="YYYY-MM-DD HH:mm" asLink /></td>
            {showResultColumn && (
              <td>{event.result}</td>
            )}
            <td>{event.notes}</td>
            {canEdit && (
              <td>
                <Button onClick={() => onEdit?.(event)}>Edit</Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
