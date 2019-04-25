import React, { Component } from 'react';
import {
    Progress,
    Popover,
    PopoverBody,
    InputGroup,
    Input,
    InputGroupAddon,
    UncontrolledDropdown,
    DropdownItem,
    DropdownToggle,
    DropdownMenu
} from "reactstrap";
import { FaCog } from "react-icons/fa";
import './sensorValue.css'

class SensorValue extends Component {

    state = {
        currentValue: 0,
        config: {
            type: 'PROGRESS',
            lowerThreshold: 0,
            upperThreshold: 2000,
            lightValue: 0

        },
        ValueConfigPopover: false
    }

    componentWillReceiveProps = () => {
        if (this.props.value > this.state.config.lowerThreshold && this.props.value < this.state.config.upperThreshold) {
            this.setState({ currentValue: this.props.value })
        }
    }



    render = () => {
        return (
            <div className='sensor-value'>
                <div className='sensor-value__display'>
                    {(_ => {
                        switch (this.state.config.type) {
                            case 'NUMBER':
                                return (
                                    <p>{this.state.currentValue.toString()}</p>
                                )
                            case 'PROGRESS':
                                return (
                                    <Progress max={this.state.config.upperThreshold - this.state.config.lowerThreshold} value={(this.state.currentValue - this.state.config.lowerThreshold).toString()} style={{ width: 200, height: 20 }} />
                                )
                            case 'LIGHT':
                                return (
                                    <div className='sensor-value__light' style={{ backgroundColor: (this.state.currentValue < this.state.config.lightValue) ? 'green' : 'red' }} >
                                    {this.state.currentValue}
                                    </div>
                                )
                        }
                    })()

                    }
                </div>
                <Popover placement="right-end" className="value-display-popover" isOpen={this.state.ValueConfigPopover} trigger='legacy' target={_ => window.document.getElementById(this.props.sensor.sensorId)} toggle={_ => this.setState(prevState => ({ ValueConfigPopover: !prevState.ValueConfigPopover }))}>
                    <PopoverBody>
                        <InputGroup className="add-sensor-form__input">
                            <InputGroupAddon addonType="prepend" >Type</InputGroupAddon>
                            <UncontrolledDropdown>
                                <DropdownToggle caret>
                                    {this.state.config.type || 'Select a type'}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem header>Select Type</DropdownItem>
                                    <DropdownItem onClick={_ => this.setState(prevState => ({ ...prevState, config: { ...prevState.config, type: 'NUMBER' } }))}>Number</DropdownItem>
                                    <DropdownItem onClick={_ => this.setState(prevState => ({ ...prevState, config: { ...prevState.config, type: 'PROGRESS' } }))}>Progress</DropdownItem>
                                    <DropdownItem onClick={_ => this.setState(prevState => ({ ...prevState, config: { ...prevState.config, type: 'LIGHT' } }))}>Light</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </InputGroup>
                        <InputGroup className="add-sensor-form__input">
                            <InputGroupAddon addonType="prepend" >Lower Threshold</InputGroupAddon>
                            <Input value={this.state.config.lowerThreshold} onChange={e => {
                                e.persist()
                                this.setState(prevState => ({ ...prevState, config: { ...prevState.config, lowerThreshold: e.target.value } }))
                            }} placeholder="Lower Threshold" />
                        </InputGroup>
                        <InputGroup className="add-sensor-form__input">
                            <InputGroupAddon addonType="prepend" >Upper Threshold</InputGroupAddon>
                            <Input value={this.state.config.upperThreshold} onChange={e => {
                                e.persist()
                                this.setState(prevState => ({ ...prevState, config: { ...prevState.config, upperThreshold: e.target.value } }))
                            }} placeholder="Upper threshold" />
                        </InputGroup>
                        {this.state.config.type === 'LIGHT' && (
                            <InputGroup className="add-sensor-form__input">
                                <InputGroupAddon addonType="prepend" >Switch Value</InputGroupAddon>
                                <Input value={this.state.config.lightValue} onChange={e => {
                                    e.persist()
                                    this.setState(prevState => ({ ...prevState, config: { ...prevState.config, lightValue: e.target.value } }))
                                }} placeholder="Switch Value" />
                            </InputGroup>
                        )}


                    </PopoverBody>
                </Popover>
                <FaCog id={this.props.sensor.sensorId} style={{ marginLeft: 20 }} />
            </div>
        )
    }
}

export default SensorValue;