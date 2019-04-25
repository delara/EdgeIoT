import React, { Component } from 'react';
import {
    Container,
    Row
} from "reactstrap";
import axios from 'axios';
import openSocket from "socket.io-client";
import SensorValue from './SensorValue';
const io = openSocket('http://localhost:5000')

var i = 0
var intervalId = 0

class Dashboard extends Component {


    state = {
        sensors: [],
        sensorData: {},
    }

    componentDidMount = () => {
        this.getSensors()
        intervalId = setInterval(_ => {
            io.emit('sensors_data')
            i++;
        }, 100)
        io.on('data', sensorDataJson => {
            var sensorData = sensorDataJson ? JSON.parse(sensorDataJson) : {}
            this.setState({ sensorData })
        })
    }

    componentWillUnmount = () => {
        clearInterval(intervalId)
        io.removeAllListeners()
    }

    getSensors = () => {
        axios.get('http://0.0.0.0:5000/sensors')
            .then(
                res => {
                    var sensors = []
                    for (var sensorKey in JSON.parse(res.data.sensors)) {
                        sensors.push(JSON.parse(res.data.sensors)[sensorKey])
                    }
                    this.setState({ sensors })
                }
            )
    }

    render = () => {
        return (
            <div className='m-5'>
                <div className='d-flex align-items-center justify-content-center mt-2'>
                    <h1>Sensors dashboard</h1>
                </div>
                <Container style={{ marginTop: 50 }}>
                    {this.state.sensors.map(sensor => (
                        <Row key={sensor.sensorId} className='d-flex align-items-center mt-5'>
                            <h5 style={{ width: 100 }}>{sensor.name}</h5>
                            <SensorValue sensor={sensor} value={this.state.sensorData[sensor.name] && this.state.sensorData[sensor.name]['value'] && this.state.sensorData[sensor.name]['value']} />
                        </Row>
                    ))}

                </Container>

            </div>

        )
    }
}

export default Dashboard;