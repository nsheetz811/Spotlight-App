import React, { Component } from 'react';
import { Button, ButtonGroup, Container, Table } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import styled from "styled-components";

class TaskList extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);
        const {cookies} = props;
        this.state = {
            incompleteTasks: [],
            completeTasks: [],
            csrfToken: cookies.get('XSRF-TOKEN'),
            isLoading: true
        };
        this.remove = this.remove.bind(this);
        this.complete = this.complete.bind(this);
    }

    componentDidMount() {
        this.setState({isLoading: true});

        fetch(`/api/projects/${this.props.match.params.projectId}/tasks`, {credentials: 'include'})
            .then(response => response.json())
            .then(data => {
                data.sort((a, b) => new Date(a.date) - new Date(b.date));

                const result = data.reduce((r, o) => {
                    r[o.completed ? 'complete' : 'incomplete'].push(o);
                    return r;
                }, {complete: [], incomplete: []});

                this.setState({
                    incompleteTasks: result.incomplete,
                    completeTasks: result.complete,
                    isLoading: false
                });
            })
            .catch(() => this.props.history.push('/projects'));
    }

    async remove(id) {
        await fetch(`/api/projects/${this.props.match.params.projectId}/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'X-XSRF-TOKEN': this.state.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(() => {
            let updatedTasks = [...this.state.incompleteTasks].filter(i => i.id !== id);
            this.setState({incompleteTasks: updatedTasks});
        });
    }

    async complete(id) {
        const task = await (await fetch(`/api/projects/${this.props.match.params.projectId}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'X-XSRF-TOKEN': this.state.csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })).json();
        let incomplete = [...this.state.incompleteTasks].filter(i => i.id !== id);
        let complete = [...this.state.completeTasks];
        complete.push(task);
        this.setState({incompleteTasks: incomplete, completeTasks: complete});
    }

    render() {
        const {incompleteTasks, completeTasks, isLoading} = this.state;

        if (isLoading) {
            return <p>Loading...</p>;
        }

        const incompleteList = incompleteTasks.map(task => {
            return <tr key={task.id}>
                <td style={{whiteSpace: 'nowrap'}}>{task.name}</td>
                <td>
                    {new Intl.DateTimeFormat('en-US').format(new Date(task.date.replace(/-/g, '\/')))}
                </td>
                <td>
                    <ButtonGroup>
                        <Button size="sm" color="primary" tag={Link} to={"/projects/" +
                            this.props.match.params.projectId + "/" + this.props.match.params.projectName + "/" + task.id}>Edit</Button>
                        <Button size="sm" color="danger" onClick={() => this.remove(task.id)}>Delete</Button>
                        <Button size="sm" color="success" onClick={() => this.complete(task.id)}>Complete</Button>
                    </ButtonGroup>
                </td>
            </tr>
        });

        const completeList = completeTasks.map(task => {
            return <tr key={task.id}>
                <td style={{whiteSpace: 'nowrap'}}>{task.name}</td>
            </tr>
        });

        return (
            <Container fluid>
                <div className="float-end">
                    <Button color="primary" tag={Link} to={"/projects/" + this.props.match.params.projectId +
                        "/" + this.props.match.params.projectName + "/users"}>See Project Members</Button>{' '}
                    <Button color="success" tag={Link} to={"/projects/" + this.props.match.params.projectId +
                        "/" + this.props.match.params.projectName + "/new"}>Add Task</Button>
                </div>
                <h1>{this.props.match.params.projectName} Dashboard</h1>

                <ListContainer>
                    <h2>In Progress</h2>
                    <Table className="mt-4">
                        <thead>
                        <tr>
                            <th width="35%">Task Name</th>
                            <th width="35%">Due Date</th>
                            <th width="10%">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {incompleteList}
                        </tbody>
                    </Table>
                </ListContainer>

                <ListContainer>
                    <h2>Complete</h2>
                    <Table className="mt-4">
                        <thead>
                        <tr>
                            <th width="100%">Task Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        {completeList}
                        </tbody>
                    </Table>
                </ListContainer>
            </Container>
        );
    }
}

export default withCookies(withRouter(TaskList));

const ListContainer = styled.div`
padding-top: 10px;
padding-bottom: 10px;
`