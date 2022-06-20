import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import DatePicker from 'react-datepicker';

class TaskEdit extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    emptyItem = {
        name: '',
        date: new Date(),
        completed: false
    };

    constructor(props) {
        super(props);
        const {cookies} = props;
        this.state = {
            item: this.emptyItem,
            csrfToken: cookies.get('XSRF-TOKEN')
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
    }

    async componentDidMount() {
        if (this.props.match.params.taskId !== 'new') {
            try {
                const task = await (await fetch(`/api/projects/${this.props.match.params.projectId}/tasks/${this.props.match.params.taskId}`,
                    {credentials: 'include'})).json();
                task.date = task.date.replace(/-/g, '\/');
                this.setState({item: task});
            } catch (error) {
                this.props.history.push(`/projects/${this.props.match.params.projectId}/${this.props.match.params.projectName}`);
            }
        }
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        let item = {...this.state.item};
        item[name] = value;
        this.setState({item});
    }

    handleDateChange(date) {
        let item = {...this.state.item};
        item["date"] = date;
        this.setState({item});
    }

    async handleSubmit(event) {
        event.preventDefault();
        const {item, csrfToken} = this.state;

        await fetch(`/api/projects/${this.props.match.params.projectId}/tasks`, {
            method: (item.id) ? 'PUT' : 'POST',
            headers: {
                'X-XSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item),
            credentials: 'include'
        });
        this.props.history.push(`/projects/${this.props.match.params.projectId}/${this.props.match.params.projectName}`);
    }

    render() {
        const {item} = this.state;
        const title = <h2>{item.id ? 'Edit Task' : 'Add Task'}</h2>;

        return <div>
            <Container>
                {title}
                <Form onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Label for="name">Task Name</Label>
                        <Input type="text" name="name" id="name" value={item.name || ''}
                               onChange={this.handleChange} autoComplete="name"/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="date">Due Date</Label>
                        <DatePicker
                            selected={new Date(item.date)}
                            onChange={this.handleDateChange}
                            name="date"
                            dateFormat="MM/dd/yyyy"
                            minDate={new Date()}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Button color="primary" type="submit">Save</Button>{' '}
                        <Button color="secondary" tag={Link} to={"/projects/" + this.props.match.params.projectId +
                            "/" + this.props.match.params.projectName}>Cancel</Button>
                    </FormGroup>
                </Form>
            </Container>
        </div>
    }
}

export default withCookies(withRouter(TaskEdit));