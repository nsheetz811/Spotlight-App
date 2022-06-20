import React, { Component } from 'react';
import {withCookies} from "react-cookie";


class LogedinUser extends Component {
    state = {
        isLoading: true,
        user: undefined
    };

    constructor(props) {
        super(props);
        const {cookies} = props;
        this.state.csrfToken = cookies.get('XSRF-TOKEN');
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

    render() {
        const message = this.state.user ?
            this.state.user.name :
            '';

        return (
            <div >
                {message}
            </div>
        );
    }
}

export default withCookies(LogedinUser);