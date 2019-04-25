import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import Dashboard from './Dashboard';
import Settings from './Settings';

class App extends Component {

  state = {
    showUrl: false,
    url: '',
    send_data: false,
    airQaulity: 0,
    motion: false,
    sound: 0,
    moister: 0
  }

  componentDidMount = () => {
    

  }

  render() {
    return (

      <Tabs>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Setup</Tab>
        </TabList>

        <TabPanel>
          <Dashboard />
        </TabPanel>
        <TabPanel>
          <Settings />
        </TabPanel>
      </Tabs>

    );
  }
}


export default App;
