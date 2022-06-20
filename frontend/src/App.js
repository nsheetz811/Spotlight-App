import React, { Component } from 'react';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ProjectList from './ProjectList';
import ProjectEdit from "./ProjectEdit";
import TaskList from "./TaskList";
import TaskEdit from "./TaskEdit";
import InvitationList from "./InvitationList";
import {CookiesProvider} from "react-cookie";
import Header from './ZachsComponents/Header';
import styled from "styled-components"
import Sidebar from "./ZachsComponents/Sidebar"
import UserList from './UserList';


class App extends Component {
  render() {
    return (
      <div className='app'>
        <CookiesProvider>
          <Router>
            <Header />
            <AppBody>
              <Sidebar />
                <ComponentBody>
                <Switch>
                  <Route path='/' exact={true} component={Home}/>
                  <Route path='/invitations' exact={true} component={InvitationList}/>
                  <Route path='/projects' exact={true} component={ProjectList}/>
                  <Route exact path='/projects/:projectId' component={ProjectEdit}/>
                  <Route exact path='/projects/:projectId/:projectName' component={TaskList}/>
                  <Route exact path='/projects/:projectId/:projectName/users' component={UserList}/>
                  <Route exact path='/projects/:projectId/:projectName/:taskId' component={TaskEdit}/>
                </Switch>
                </ComponentBody>
            </AppBody>
          </Router>
        </CookiesProvider>
        </div>
    )
  }
}

export default App;

const AppBody = styled.div`
display: flex;
height: 100vh;
`

const ComponentBody = styled.div`
flex: 0.7;
flex-grow: 1;
overflow-y: scroll;
margin-top: 60px;
padding: 13px;
`