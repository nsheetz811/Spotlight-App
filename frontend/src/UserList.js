import React, { Component } from 'react';
import {Button, Container, Form, FormGroup, Input, Label, Table} from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

class UserList extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    emptyItem = {
        email: '',
    };

    constructor(props) {
        super(props);
        const {cookies} = props;
        this.state = {
            item: this.emptyItem,
            users: [],
            error: '',
            csrfToken: cookies.get('XSRF-TOKEN'),
            isLoading: true
        };
        this.remove = this.remove.bind(this);
        this.reloadUsers = this.reloadUsers.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.setState({isLoading: true});

        fetch(`/api/projects/${this.props.match.params.projectId}/users`, {credentials: 'include'})
            .then(response => response.json())
            .then(data => this.setState({users: data, isLoading: false}))
            .catch(() => this.props.history.push('/projects'));
    }

    async remove(id) {
        await fetch(`/api/projects/${this.props.match.params.projectId}/users/${id}`, {
            method: 'DELETE',
            headers: {
                'X-XSRF-TOKEN': this.state.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(() => {
            this.reloadUsers();
        });
    }

    async reloadUsers() {
        await fetch(`/api/projects/${this.props.match.params.projectId}/users`, {credentials: 'include'})
            .then(response => response.json())
            .then(data => this.setState({users: data}))
            .catch(() => this.props.history.push('/projects'));
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        let item = {...this.state.item};
        item[name] = value;
        this.setState({item});
    }

    async handleSubmit(event) {
        event.preventDefault();
        event.target.reset();
        const {item, csrfToken} = this.state;

        try {
            const response = await (await fetch(`/api/invitations/${this.props.match.params.projectId}`, {
                method: 'POST',
                headers: {
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: item.email,
                credentials: 'include'
            })).json();
            this.setState({item: this.emptyItem, error: ''});
        } catch (error) {
            this.setState({error: 'This user does not exist or is already invited. Please try again.'});
        }
    }

    render() {
        const {item, users, isLoading} = this.state;

        if (isLoading) {
            return <p>Loading...</p>;
        }

        const userList = users.map(user => {
            return <tr key={user.id}>
                <td style={{whiteSpace: 'nowrap'}}>{user.name}</td>
                <td>{user.email}</td>
                <td><Button size="sm" color="danger" onClick={() => this.remove(user.id)}>Remove</Button></td>
            </tr>
        });

        return (
            <div>
                <Container>
                    <h2>Add Users</h2>
                    <p style={{color: "red"}}>{this.state.error}</p>
                    <Form onSubmit={this.handleSubmit}>
                        <FormGroup>
                            <Label for="email">Email</Label>
                            <Input type="text" name="email" id="email" value={item.email || ''}
                                   onChange={this.handleChange} autoComplete="email"/>
                        </FormGroup>
                        <FormGroup>
                            <Button color="primary" type="submit">Add</Button>
                        </FormGroup>
                    </Form>
                </Container>
                <Container>
                    <h2>{this.props.match.params.projectName} Users</h2>
                    <Table className="mt-4">
                        <thead>
                        <tr>
                            <th width="30%">Users</th>
                            <th width="60%">Email</th>
                            <th width="10%">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userList}
                        </tbody>
                    </Table>
                </Container>
            </div>
        );
    }
}

export default withCookies(withRouter(UserList));