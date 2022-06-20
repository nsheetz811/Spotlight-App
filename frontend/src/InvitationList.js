import React, { Component } from 'react';
import { Button, ButtonGroup, Container, Table } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

class InvitationList extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);
        const {cookies} = props;
        this.state = {invitations: [], csrfToken: cookies.get('XSRF-TOKEN'), isLoading: true};
        this.response = this.response.bind(this);
    }

    componentDidMount() {
        this.setState({isLoading: true});

        fetch('api/invitations', {credentials: 'include'})
            .then(response => response.json())
            .then(data => this.setState({invitations: data, isLoading: false}))
            .catch(() => this.props.history.push('/'));
    }

    async response(choice, id) {
        await fetch(`/api/invitations/${id}`, {
            method: (choice === "accept") ? 'PUT' : 'DELETE',
            headers: {
                'X-XSRF-TOKEN': this.state.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(() => {
            let updatedInvitations = [...this.state.invitations].filter(i => i.id !== id);
            this.setState({invitations: updatedInvitations});
        });
    }

    render() {
        const {invitations, isLoading} = this.state;

        if (isLoading) {
            return <p>Loading...</p>;
        }

        const invitationList = invitations.map(invitation => {
            return <tr key={invitation.id}>
                <td style={{whiteSpace: 'nowrap'}}>{invitation.project.name}</td>
                <td>
                    <ButtonGroup>
                        <Button size="sm" color="primary" onClick={() => this.response("accept", invitation.id)}>Accept</Button>
                        <Button size="sm" color="danger" onClick={() => this.response("decline", invitation.id)}>Decline</Button>
                    </ButtonGroup>
                </td>
            </tr>
        });

        return (
            <Container fluid>
                <h1>My Invitations</h1>
                <Table className="mt-4">
                    <thead>
                    <tr>
                        <th width="90%">Projects</th>
                        <th width="10%">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invitationList}
                    </tbody>
                </Table>
            </Container>
        );
    }
}

export default withCookies(withRouter(InvitationList));