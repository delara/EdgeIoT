import React, { Component } from 'react';
import {
    Row,
    Col,
    InputGroup,
    Input,
    InputGroupAddon,
    PopoverBody,
    Popover,
    Button,
    Spinner,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
import axios from "axios";
import './Settings.css';
import { FaPlus } from "react-icons/fa";
import Switch from "react-switch";



const pins = [

    { label: 'IOLine.DIO0_AD0', value: 0 },
    { label: 'IOLine.DIO1_AD1', value: 1 },
    { label: 'IOLine.DIO2_AD2', value: 2 },
    { label: 'IOLine.DIO3_AD3', value: 3 },
    { label: 'IOLine.DIO4_AD4', value: 4 },
    { label: 'IOLine.DIO5_AD5', value: 5 },
    { label: 'IOLine.DIO6', value: 6 },
    { label: 'IOLine.DIO7', value: 7 },
    { label: 'IOLine.DIO8', value: 8 },
    { label: 'IOLine.DIO9', value: 9 },
    { label: 'IOLine.DIO10_PM0', value: 10 },
    { label: 'IOLine.DIO11_PWM1', value: 11 },
    { label: 'IOLine.DIO12', value: 12 },
    { label: 'IOLine.DIO13', value: 13 },
    { label: 'IOLine.DIO14', value: 14 },
    { label: 'IOLine.DIO15', value: 15 },
    { label: 'IOLine.DIO16', value: 16 },
    { label: 'IOLine.DIO17', value: 17 },
    { label: 'IOLine.DIO18', value: 18 },
    { label: 'IOLine.DIO19', value: 19 },

]


class Settings extends Component {

    state = {
        sensors: [],
        actuators: [],
        config: {
            actuatorsConfig: {},
            post: {}
        },
        tempConfig: {
            actuatorsConfig: {},
            post: {}
        },
        showUrl: false,
        send_data: false,
        url: '',
        addSensorPopover: false,
        addActuatorPopover: false,
        addSensorLoading: false,
        addSensorError: '',
        addActuatorLoading: false,
        addActuatorError: '',
        sensorName: '',
        sensorXbeeId: '',
        sensorIOPin: '',
        actuatorName: '',
        actuatorAddress: '',
        actuatorConfigPopover: false,
        setActuatorConfigError: '',
        setActuatorConfigLoading: false,
        currentActuatorId: ''
    }

    componentDidMount = () => {
        this.getSensors()
        this.getActuators()
        this.getConfig()
    }

    getConfig = () => {

        axios.get('http://0.0.0.0:5000/config')
            .then(
                res => {

                    this.setState({ config: JSON.parse(res.data.config), tempConfig: JSON.parse(res.data.config) })
                    console.log(res.data)
                }
            )
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
                    console.log(sensors)
                }
            )
    }

    getActuators = () => {

        axios.get('http://0.0.0.0:5000/actuators')
            .then(
                res => {
                    var actuators = []
                    console.log(res.data)
                    for (var actuatorKey in JSON.parse(res.data.actuators)) {
                        actuators.push(JSON.parse(res.data.actuators)[actuatorKey])
                    }
                    this.setState({ actuators })
                    console.log(actuators)
                }
            )
    }

    addSensor = () => {
        this.setState({ addSensorLoading: true, addSensorError: '' })
        axios.post('http://0.0.0.0:5000/sensors', {
            name: this.state.sensorName,
            xbeeAddress: this.state.sensorXbeeId,
            IOLine: this.state.sensorIOPin
        }, { headers: { 'Content-Type': 'application/json' } })
            .then(
                res => {
                    this.setState({ addSensorLoading: false, addSensorPopover: false })
                    this.getSensors()
                }
            )
            .catch(err => {
                this.setState({ addSensorLoading: false, addSensorError: JSON.parse(JSON.stringify(err.response.data)) })
            })
    }

    addActuator = () => {
        this.setState({ addActuatorLoading: true, addActuatorError: '' })
        axios.post('http://0.0.0.0:5000/actuators', {
            name: this.state.actuatorName,
            plugAddress: this.state.actuatorAddress
        }, { headers: { 'Content-Type': 'application/json' } })
            .then(
                res => {
                    this.setState({ addActuatorError: false, addActuatorPopover: false })
                    this.getActuators()
                }
            )
            .catch(err => {
                this.setState({ addActuatorLoading: false, addActuatorError: JSON.parse(JSON.stringify(err.response.data)) })
            })
    }

    updateConfig = () => {
        console.log(this.state.tempConfig)
        axios.post('http://0.0.0.0:5000/config', this.state.tempConfig, { headers: { 'Content-Type': 'application/json' } })
            .then(
                res => {
                    this.setState(prevState => ({ config: prevState.tempConfig }))
                }
            )
            .catch(err => {
                console.log(err)
            })
    }

    render = () => {
        console.log(this.state.tempConfig)
        return (
            <div>
                <Row className="container">
                    <h4 className="label">Sensors: </h4>
                    {this.state.sensors.map(sensor => (
                        <div key={sensor.sensorId} className="sensor">
                            <p style={{ fontSize: 20, marginBottom: 0 }}>{sensor.name}</p>
                            <p style={{ fontSize: 4 }}>{sensor.sensorId}</p>
                            <img style={{ width: 50, height: 50 }} src={require('./sensor.png')} />
                        </div>
                    ))}
                    <div className="sensor sensor__add" id="sensor-add">
                        <FaPlus />
                    </div>
                </Row>
                <Row className="container">
                    <h4 className="label">Actuators: </h4>
                    {this.state.actuators.map(actuator => (
                        <div key={actuator.actuatorId} className="actuator" onClick={_ => {
                            this.setState({ currentActuatorId: actuator.actuatorId, actuatorConfigPopover: true })
                        }} id={actuator.actuatorId}>
                            <p style={{ fontSize: 20, marginBottom: 0 }}>{actuator.name}</p>
                            <p style={{ fontSize: 4 }}>{actuator.actuatorId}</p>
                            <img style={{ width: 30, height: 30, marginTop: 10 }} src={require('./actuator.png')} />
                        </div>
                    ))}
                    <div className="actuator actuator__add" id="actuator-add">
                        <FaPlus />
                    </div>
                </Row>

                <Row className='mt-5 ml-5 mr-5'>
                    {this.state.showUrl ? (
                        <InputGroup>
                            <Input onChange={event => {
                                if (this.state.send_data) {
                                    this.setState({ send_data: false })
                                }
                                this.setState({ url: event.target.value })
                            }} value={this.state.url} placeholder="URL of destination" />
                            <InputGroupAddon addonType="append">
                                <Button
                                    onClick={_ => {
                                        this.setState(prevState => ({ ...prevState, send_data: true, tempConfig: { ...prevState.tempConfig, post: { url: prevState.url, active: !prevState.send_data } } }), _ => {
                                            this.updateConfig()
                                        })
                                    }}
                                    style={{ backgroundColor: this.state.send_data ? 'red' : 'green' }}>{this.state.send_data ? 'STOP' : 'SEND'}</Button>
                            </InputGroupAddon>
                        </InputGroup>
                    ) : (
                            <p onClick={_ => this.setState({ showUrl: true })} style={{ color: 'blue', cursor: 'pointer' }}>send data</p>
                        )}
                </Row>

                <Popover placement="right-end" className="add-sensor-popover" isOpen={this.state.addSensorPopover} trigger='legacy' target="sensor-add" toggle={_ => this.setState(prevState => ({ addSensorPopover: !prevState.addSensorPopover }))}>

                    <PopoverBody className="add-sensor-form">
                        <h5>Add Sensor</h5>
                        <InputGroup className="add-sensor-form__input">
                            <InputGroupAddon addonType="prepend" >Name</InputGroupAddon>
                            <Input value={this.state.sensorName} onChange={e => this.setState({ sensorName: e.target.value })} placeholder="Name" />
                        </InputGroup>
                        <InputGroup className="add-sensor-form__input">
                            <InputGroupAddon addonType="prepend" >Xbee Id</InputGroupAddon>
                            <Input value={this.state.sensorXbeeId} onChange={e => this.setState({ sensorXbeeId: e.target.value })} placeholder="Xbee Id" />
                        </InputGroup>
                        <InputGroup className="add-sensor-form__input">
                            <InputGroupAddon addonType="prepend" >Input Pin</InputGroupAddon>
                            <UncontrolledDropdown>
                                <DropdownToggle caret>
                                    {pins.find(p => p.value === this.state.sensorIOPin) && pins.find(p => p.value === this.state.sensorIOPin)['label'] || 'Select an input pin'}
                                </DropdownToggle>
                                <DropdownMenu modifiers={{
                                    setMaxHeight: {
                                        enabled: true,
                                        order: 890,
                                        fn: (data) => ({ ...data, styles: { ...data.styles, overflow: 'auto', maxHeight: 300, }, }),
                                    },
                                }}>
                                    <DropdownItem header>Header</DropdownItem>
                                    {pins.map(pin => (
                                        <DropdownItem onClick={_ => this.setState({ sensorIOPin: pin.value })} >{pin.label}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </UncontrolledDropdown>
                            {/* <Input value={this.state.sensorIOPin} onChange={e => this.setState({ sensorIOPin: e.target.value })} placeholder="Input Pin" /> */}
                        </InputGroup>
                        <p className="add-sensor-form__error">{this.state.addSensorError}</p>
                        <Button
                            className="add-sensor-form__button"
                            onClick={this.addSensor}
                        >
                            {this.state.addSensorLoading ? (<Spinner size="sm" />) : ('Add Sensor')}
                        </Button>

                    </PopoverBody>

                </Popover>

                <Popover className="add-actuator-popover" isOpen={this.state.addActuatorPopover} trigger='legacy' target="actuator-add" toggle={_ => this.setState(prevState => ({ addActuatorPopover: !prevState.addActuatorPopover }))}>
                    <PopoverBody>
                        <h5>Add Actuator</h5>
                        <InputGroup className="add-actuator-form__input">
                            <InputGroupAddon addonType="prepend" >Name</InputGroupAddon>
                            <Input value={this.state.actuatorName} onChange={e => this.setState({ actuatorName: e.target.value })} placeholder="Name" />
                        </InputGroup>
                        <InputGroup className="add-actuator-form__input">
                            <InputGroupAddon addonType="prepend" >Plug Address</InputGroupAddon>
                            <Input value={this.state.actuatorAddress} onChange={e => this.setState({ actuatorAddress: e.target.value })} placeholder="Xbee Id" />
                        </InputGroup>
                        <p className="add-actuator-form__error">{this.state.addActuatorError}</p>
                        <Button
                            className="add-actuator-form__button"
                            onClick={this.addActuator}>
                            {this.state.addActuatorLoading ? (<Spinner size="sm" />) : ('Add Actuator')}
                        </Button>
                    </PopoverBody>
                </Popover>

                <Popover className="add-actuator-popover" isOpen={this.state.actuatorConfigPopover} trigger='legacy' target={_ => window.document.getElementById(this.state.currentActuatorId)} toggle={_ => this.setState(prevState => ({ actuatorConfigPopover: !prevState.actuatorConfigPopover }))}>
                    <PopoverBody>
                        <h5>Actuator</h5>
                        <span>
                            AUTO
                                <Switch
                                onChange={value => {
                                    const newActuatorconfig = (this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) ? { ...this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId], isAuto: value } : { isAuto: value }
                                    console.log(newActuatorconfig)
                                    this.setState(prevState => ({ ...prevState, tempConfig: { ...prevState.tempConfig, actuatorsConfig: { ...prevState.tempConfig.actuatorsConfig, [prevState.currentActuatorId]: newActuatorconfig } } }))
                                }} checked={(this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId] && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId].isAuto) || false} />

                        </span>
                        <InputGroup className="add-actuator-form__input">
                            <InputGroupAddon addonType="prepend" >Sensor Id</InputGroupAddon>

                            <UncontrolledDropdown>
                                <DropdownToggle disabled={(this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) ? !this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId].isAuto : true} caret>
                                    {(this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId] && this.state.sensors.find(s => s.sensorId == this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId].sensorId)) ? this.state.sensors.find(s => s.sensorId == this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId].sensorId)['name'] : 'Select Sensor'}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem header>Select Sensor</DropdownItem>
                                    {this.state.sensors.map(sensor => (
                                        <DropdownItem onClick={_ => {
                                            if (this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) {
                                                this.setState(prevState => ({ ...prevState, tempConfig: { ...prevState.tempConfig, actuatorsConfig: { ...prevState.tempConfig.actuatorsConfig, [this.state.currentActuatorId]: { ...prevState.tempConfig.actuatorsConfig[prevState.currentActuatorId], sensorId: sensor.sensorId } } } }))
                                            } else {
                                                this.setState(prevState => ({ ...prevState, tempConfig: { ...prevState.tempConfig, actuatorsConfig: { ...prevState.tempConfig.actuatorsConfig, [prevState.currentActuatorId]: { sensorId: sensor.sensorId } } } }))
                                            }
                                        }}>{sensor.name}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </InputGroup>
                        <InputGroup className="add-actuator-form__input">
                            <InputGroupAddon addonType="prepend" >Relation</InputGroupAddon>

                            <UncontrolledDropdown>
                                <DropdownToggle disabled={(this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) ? !this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId].isAuto : true} caret>
                                    {(this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) ? this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId].type : 'Select Relation'}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem header>Select Relation</DropdownItem>
                                    <DropdownItem
                                        onClick={_ => {
                                            if (this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) {
                                                this.setState(prevState => ({ ...prevState, tempConfig: { ...prevState.tempConfig, actuatorsConfig: { ...prevState.tempConfig.actuatorsConfig, [this.state.currentActuatorId]: { ...prevState.tempConfig.actuatorsConfig[prevState.currentActuatorId], type: '>' } } } }))
                                            } else {
                                                this.setState(prevState => ({ ...prevState, tempConfig: { ...prevState.tempConfig, actuatorsConfig: { ...prevState.tempConfig.actuatorsConfig, [prevState.currentActuatorId]: { type: '>' } } } }))
                                            }
                                        }} >higher than</DropdownItem>
                                    <DropdownItem
                                        onClick={_ => {
                                            if (this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) {
                                                this.setState(prevState => ({ ...prevState, tempConfig: { ...prevState.tempConfig, actuatorsConfig: { ...prevState.tempConfig.actuatorsConfig, [this.state.currentActuatorId]: { ...prevState.tempConfig.actuatorsConfig[prevState.currentActuatorId], type: '<' } } } }))
                                            } else {
                                                this.setState(prevState => ({ ...prevState, tempConfig: { ...prevState.tempConfig, actuatorsConfig: { ...prevState.tempConfig.actuatorsConfig, [prevState.currentActuatorId]: { type: '<' } } } }))
                                            }
                                        }}>
                                        Lowen than</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </InputGroup>
                        <InputGroup className="add-actuator-form__input">
                            <InputGroupAddon addonType="prepend" >Threshold</InputGroupAddon>
                            <Input
                                value={(this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) ? this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId].threshold : ''}
                                onChange={e => {
                                    e.persist()
                                    if (this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) {
                                        this.setState(prevState => ({ ...prevState, tempConfig: { ...prevState.tempConfig, actuatorsConfig: { ...prevState.tempConfig.actuatorsConfig, [this.state.currentActuatorId]: { ...prevState.tempConfig.actuatorsConfig[prevState.currentActuatorId], threshold: e.target.value } } } }))
                                    } else {
                                        this.setState(prevState => ({ ...prevState, tempConfig: { ...prevState.tempConfig, actuatorsConfig: { ...prevState.tempConfig.actuatorsConfig, [prevState.currentActuatorId]: { threshold: e.target.value } } } }))
                                    }
                                }}
                                disabled={(this.state.tempConfig.actuatorsConfig && this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId]) ? !this.state.tempConfig.actuatorsConfig[this.state.currentActuatorId].isAuto : true}
                                placeholder="Threshold" />
                        </InputGroup>
                        <p className="add-actuator-form__error">{this.state.setActuatorConfigError}</p>
                        <Button
                            className="add-actuator-form__button"
                            onClick={this.updateConfig}>
                            {this.state.setActuatorConfigLoading ? (<Spinner size="sm" />) : ('Done')}
                        </Button>
                    </PopoverBody>
                </Popover>

            </div>
        )
    }
}

export default Settings