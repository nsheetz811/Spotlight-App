import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import {withCookies} from "react-cookie";

class Home extends Component {
    state = {
        isLoading: true,
        isAuthenticated: false,
        user: undefined
    };

    constructor(props) {
        super(props);
        const {cookies} = props;
        this.state.csrfToken = cookies.get('XSRF-TOKEN');
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    async componentDidMount() {
        const response = await fetch('/api/user', {credentials: 'include'});
        const body = await response.text();
        if (body === '') {
            this.setState(({isAuthenticated: false}))
        } else {
            this.setState({isAuthenticated: true, user: JSON.parse(body)})
        }
    }

    login() {
        let port = (window.location.port ? ':' + window.location.port : '');
        if (port === ':3000') {
            port = ':8080';
        }
        window.location.href = '//' + window.location.hostname + port + '/private';
    }

    logout() {
        fetch('/api/logout', {method: 'POST', credentials: 'include',
            headers: {'X-XSRF-TOKEN': this.state.csrfToken}}).then(res => res.json())
            .then(response => {
                window.location.href = response.logoutUrl + "?id_token_hint=" +
                    response.idToken + "&post_logout_redirect_uri=" + window.location.origin;
            });
    }

    render() {
        const message = this.state.user ?
            <h1>Welcome to Spotlight, {this.state.user.name}!</h1> :
            <div>
                <h1>Welcome to Spotlight!</h1>
                <p>Please log in to manage your Projects.</p>
            </div>;

        const button = this.state.isAuthenticated ?
            <div>
                <Button color="link"><Link to="/projects">Manage Projects</Link></Button>
                <br/>
                <Button color="link"><Link to="/invitations">See Invitations</Link></Button>
                <br/>
                <Button color="link" onClick={this.logout}>Logout</Button>
            </div> :
            <Button color="primary" onClick={this.login}>Login</Button>;

        return (
            <div>
                {message}
                {button}
            </div>
        );
    }
}

export default withCookies(Home);