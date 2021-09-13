import { ApiPingTemplate } from '@ping-board/common'
import { ChangeEvent, useEffect, useState } from 'react'
import { Alert, Button, Col, Form, ListGroup, Modal, Row, Spinner } from 'react-bootstrap'
import { Prompt } from 'react-router-dom'
import { useGetPingTemplatesQuery, usePostPingMutation } from '../../store'

export function SendPings(): JSX.Element {
  const pingTemplates = useGetPingTemplatesQuery()
  const [postPing, postPingState] = usePostPingMutation()

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
    pingText.indexOf(oldTextSeparator) === -1
  )

  const sendPing = () => {
    if (canSend && selectedTemplate && pingText) {
      postPing({
        templateId: selectedTemplate.id,
        text: pingText,
      })
      setShowSendingDialog(true)
    }
  }

  return (
    <Form>
      <Prompt
        when={pingTextModified}
        message="You haven't sent your ping yet. Are you sure you want to leave?"
      />

      <Row>
        <Col xs={12}>
          <Alert variant="warning">
            <i className="bi-exclamation-triangle" />{' '}
            If you send <b>bad pings</b> you <b>will be banned from sending pings</b>. Use the
            template, if possible. Also, <b>don&apos;t spam newlines and emoji in your pings or
            you&apos;ll have your ping rights revoked</b>. Make sure you send your pings to the
            correct group. Some groups are meant for emergencies, don&apos;t randomly ping them.
            Just use it responsibly.
          </Alert>
        </Col>

        <Form.Group as={Col} xs={12} md={4} className="mb-3">
          <Form.Label>Send ping to group:</Form.Label>
          <ListGroup>
            {pingTemplates.data?.templates.map(t => (
              <ListGroup.Item key={t.id}
                type="button"
                action
                // variant="dark"
                active={t === selectedTemplate}
                onClick={() => handlePingGroupChange(t)}
              >
                {t.name} (#{t.slackChannelName})
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form.Group>

        <Form.Group as={Col} xs={12} md={8} className="mb-3">
          <Form.Label>Ping text:</Form.Label>
          <Form.Control
            as="textarea"
            rows={15}
            disabled={!selectedTemplate}
            placeholder={selectedTemplate ? '' : 'Please select a channel first.'}
            value={selectedTemplate ? pingText : ''}
            onChange={handlePingTextChange}
          />
        </Form.Group>

        <Col xs={12} style={{ display: 'flex' }}>
          <div style={{ flex: 1 }} />
          <Button variant="danger" disabled={!canSend} onClick={sendPing}>
            Send Ping
          </Button>
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
      </Row>
    </Form>
  )
}
