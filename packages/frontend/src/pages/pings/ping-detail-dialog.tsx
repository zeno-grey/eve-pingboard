import { ApiPing } from '@ping-board/common'
import { Modal, ModalProps } from 'react-bootstrap'
import { PingDetails } from '../../components/ping-details'

export interface PingDetailDialogProps {
  ping: ApiPing | null
}
export function PingDetailDialog({
  ping,
  ...modalProps
}: PingDetailDialogProps & Omit<ModalProps, 'show'>): JSX.Element {
  return (
    <Modal show={!!ping} {...modalProps}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi-broadcast-pin" />{' '}
          {ping?.scheduledTitle || `${ping?.author} to ${ping?.slackChannelName}`}
          <h6 className="m-0">
            {ping?.scheduledFor && 'Scheduled/Pre-'}Ping
          </h6>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {ping && (
          <PingDetails ping={ping} />
        )}
      </Modal.Body>
    </Modal>
  )
}
