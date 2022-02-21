import { Alert, Col, Container, Form, ListGroup, Row } from 'react-bootstrap'
import { Link, Outlet, useParams } from 'react-router-dom'
import { UserRoles } from '@ping-board/common'
import { useGetPingTemplatesQuery, useGetUserQuery } from '../../store'
import './send.scss'

export function SendPingLayout(): JSX.Element {
  const me = useGetUserQuery()

  const canEdit = me.data?.isLoggedIn &&
    me.data.character.roles.includes(UserRoles.PING_TEMPLATES_WRITE)

  const params = useParams()
  const activeTemplateId = (
    typeof params.templateId === 'string' && Number(params.templateId)
  ) ?? null

  const templates = useGetPingTemplatesQuery()

  return (
    <Container className="h-100 mh-100 d-flex flex-column send-pings">
      <div className="pings-header">
        <h3>Send Ping</h3>
        <Link to="../sent" className="btn btn-primary" role="button">
          Show Sent Pings
        </Link>
        <div style={{ flex: 1 }} />
        {canEdit &&
          <Link to="../templates" className="btn btn-primary" role="button">
            <i className="bi-wrench" /> Manage Ping Templates
          </Link>
        }
      </div>
      <Alert variant="warning" className="py-2">
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
            {templates.data?.templates.map(t => (
              <ListGroup.Item key={t.id}
                type="button"
                action
                active={activeTemplateId === t.id}
                as={Link}
                to={t.id.toString()}
              >
                {t.name} (#{t.slackChannelName})
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form.Group>

        <Col xs={12} md={8} className="pb-3 ping-column">
          <Outlet />
        </Col>
      </Form>
    </Container>
  )
}
