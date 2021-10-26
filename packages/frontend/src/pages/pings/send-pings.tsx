import { ApiPingTemplate, UserRoles } from '@ping-board/common'
import clsx from 'clsx'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  ListGroup,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap'
import { Link, Prompt, useRouteMatch } from 'react-router-dom'
import { DateTimeInput } from '../../components/date-time-input'
import { RelativeTimeInput } from '../../components/relative-time-input'
import { useAbsoluteRelativeTimeInput } from '../../hooks/use-absolute-relative-time-input'
import { useGetPingTemplatesQuery, useAddPingMutation, useGetUserQuery } from '../../store'
import { dayjs } from '../../utils/dayjs'
import './send-pings.scss'

export function SendPings(): JSX.Element {
  const me = useGetUserQuery()

  const canEdit = me.data?.isLoggedIn &&
    me.data.character.roles.includes(UserRoles.PING_TEMPLATES_WRITE)

  const pingTemplates = useGetPingTemplatesQuery()
  const [postPing, postPingState] = useAddPingMutation()

  const [addPingToCalendar, setAddPingToCalendar] = useState(false)
  const time = useMemo(() => ({ time: { relative: dayjs.duration(0) } }), [])
  const timeInput = useAbsoluteRelativeTimeInput(time)
  const [calendarEntryTitle, setCalendarEntryTitle] = useState('')

  const [selectedTemplate, setSelectedTemplate] = useState<ApiPingTemplate | null>(null)
  const [pingText, setPingText] = useState<string>('')
  const [pingTextModified, setPingTextModified] = useState(false)
  const handlePingTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPingText(e.target.value)
    setPingTextModified(true)
  }

  const oldTextSeparator = '\n\n--- old text ---\n\n'
  const handlePingGroupChange = (template: ApiPingTemplate) => {
    setSelectedTemplate(template ?? null)
    if (!template) {
      return
    }
    const [currentText, oldText] = pingText.split(oldTextSeparator, 2)
    if (currentText === selectedTemplate?.template || currentText === '') {
      if (oldText) {
        setPingText(template.template + oldTextSeparator + oldText)
        setPingTextModified(true)
      } else {
        setPingText(template.template)
        setPingTextModified(false)
      }
    } else if (currentText !== template.template) {
      setPingText(template.template + oldTextSeparator + currentText)
      setPingTextModified(true)
    } else {
      setPingText(template.template)
      setPingTextModified(false)
    }
  }

  const [showSendingDialog, setShowSendingDialog] = useState(false)
  const [sendDialogClosing, setSendDialogClosing] = useState(false)
  useEffect(() => {
    if (showSendingDialog && !sendDialogClosing && !postPingState.isLoading) {
      setSendDialogClosing(true)
      setTimeout(() => {
        setShowSendingDialog(false)
        setSendDialogClosing(false)
      }, 2000)
      setPingTextModified(!postPingState.isSuccess)
    }
  }, [postPingState.isLoading, postPingState.isSuccess, sendDialogClosing, showSendingDialog])

  const canSend = (
    selectedTemplate &&
    pingText !== selectedTemplate?.template &&
    pingText !== '' &&
    pingText.indexOf(oldTextSeparator) === -1 &&
    (!addPingToCalendar || !!calendarEntryTitle)
  )

  const sendPing = () => {
    if (canSend && selectedTemplate && pingText) {
      postPing({
        templateId: selectedTemplate.id,
        text: pingText,
        ...selectedTemplate.allowScheduling && addPingToCalendar ? {
          scheduledTitle: calendarEntryTitle,
          scheduledFor: timeInput.absoluteTime.toISOString(),
        } : {},
      })
      setShowSendingDialog(true)
    }
  }

  const { url } = useRouteMatch()

  return (
    <Container className="h-100 mh-100 d-flex flex-column send-pings">
      <Prompt
        when={pingTextModified}
        message="You haven't sent your ping yet. Are you sure you want to leave?"
      />
      <div className="pings-header">
        <h3>Send Pings</h3>
        <Link to={`${url}/sent`} className="btn btn-primary" role="button">
          Show Sent Pings
        </Link>
        <div style={{ flex: 1 }} />
        {canEdit &&
          <Link to={`${url}/templates`} className="btn btn-primary" role="button">
            <i className="bi-wrench" /> Manage Ping Templates
          </Link>
        }
      </div>
      <Alert variant="warning">
        <i className="bi-exclamation-triangle" />{' '}
        If you send <b>bad pings</b> you <b>will be banned from sending pings</b>. Use the
        template, if possible. Also, <b>don&apos;t spam newlines and emoji in your pings or
        you&apos;ll have your ping rights revoked</b>. Make sure you send your pings to the
        correct group. Some groups are meant for emergencies, don&apos;t randomly ping them.
        Just use it responsibly.
      </Alert>
      <Form as={Row} className="pings-container">
        <Form.Group as={Col} xs={12} md={4} className="mb-3 pb-3 template-column">
          <Form.Label>Send Ping to Group:</Form.Label>
          <ListGroup className="templates">
            {pingTemplates.data?.templates.map(t => (
              <ListGroup.Item key={t.id}
                type="button"
                action
                active={t === selectedTemplate}
                onClick={() => handlePingGroupChange(t)}
              >
                {t.name} (#{t.slackChannelName})
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form.Group>

        <Col xs={12} md={8} className="pb-3 ping-column">
          {!!selectedTemplate?.allowScheduling && (<>
            <Form.Group as={Col} controlId="schedule" xs={12} className="mb-3 pe-0">
              <Form.Label>Ping Options</Form.Label>
              <Form.Check
                checked={addPingToCalendar}
                onChange={() => setAddPingToCalendar(add => !add)}
                label="Add this Ping to the Calendar"
              />
            </Form.Group>

            {addPingToCalendar && (<>
              <Form.Group as={Col} controlid="calendarTitle" xs={12} className="mb-3 pe-0">
                <Form.Label>Calendar Entry Title</Form.Label>
                <Form.Control
                  value={calendarEntryTitle}
                  onChange={e => setCalendarEntryTitle(e.target.value)}
                />
              </Form.Group>

              <Row className="me-0">
                <Col xs={12} className="pe-0">
                  <Form.Label>Calendar Time</Form.Label>
                </Col>

                <Form.Group as={Col} controlId="eveDateTime" xs={12} lg={6} className="pe-0">
                  <Form.Label>
                    <Form.Check
                      inline
                      label="Use EVE Date and Time"
                      name="eveDateTimeMode"
                      type="radio"
                      onChange={() => timeInput.handleChangeInputMode('absolute')}
                      id="absolute"
                      checked={timeInput.inputMode === 'absolute'}
                    />
                  </Form.Label>
                  <DateTimeInput
                    value={timeInput.absoluteTime}
                    onChange={timeInput.handleAbsoluteDateChange}
                    className={clsx(
                      'time-mode-input',
                      timeInput.inputMode !== 'absolute' && 'inactive-time-mode')}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId="relativeTime" xs={12} lg={6} className="mb-3 me-0">
                  <Form.Label>
                    <Form.Check
                      inline
                      label="Use Relative Time"
                      name="eveDateTimeMode"
                      type="radio"
                      onChange={() => timeInput.handleChangeInputMode('relative')}
                      id="relative"
                      checked={timeInput.inputMode === 'relative'}
                    />
                  </Form.Label>
                  <RelativeTimeInput
                    value={timeInput.relativeTime}
                    onChange={timeInput.handleRelativeDateChange}
                    className={clsx(
                      'me-n4',
                      'time-mode-input',
                      timeInput.inputMode !== 'relative' && 'inactive-time-mode'
                    )}
                  />
                </Form.Group>
              </Row>

            </>)}

            {/* <div className="pe-0"><hr className="mt-0" /></div> */}
          </>)}

          <Form.Group as={Col} xs={12} className="mb-3 pe-0 ping">
            <Form.Label>Ping Text:</Form.Label>
            <Form.Control
              as="textarea"
              className="ping-text"
              disabled={!selectedTemplate}
              placeholder={selectedTemplate ? '' : 'Please select a channel first.'}
              value={selectedTemplate ? pingText : ''}
              onChange={handlePingTextChange}
            />
          </Form.Group>

          <Col xs={12} className="d-flex justify-content-end pe-0">
            <Button variant="primary" disabled={!canSend} onClick={sendPing}>
              Send Ping
            </Button>
          </Col>
        </Col>

        <Modal show={showSendingDialog} size="sm" backdrop="static">
          <Modal.Body className="fs-5">
            {postPingState.isLoading && <>
              <Spinner animation="border" role="status" size="sm">
                <span className="visually-hidden">Sending&hellip;</span>
              </Spinner>{' '}
              Sending&hellip;
            </>}
            {!postPingState.isLoading && postPingState.isError &&
              <span className="text-danger">
                <i className="bi-exclamation-circle" /> Failed to send ping
              </span>
            }
            {!postPingState.isLoading && postPingState.isSuccess &&
              <span className="text-success">
                <i className="bi-check-circle" /> Ping sent
              </span>
            }
          </Modal.Body>
        </Modal>
      </Form>
    </Container>
  )
}
