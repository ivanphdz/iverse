'use strict'

const EventEmitter = require('events')
const debug = require('debug')('iverse:agent')
const mqtt = require('mqtt')
const defaults = require('defaults')
const { parsePayload } = require('./utils')
const uuid = require('uuid')

const options = {
    name: 'untitled',
    username: 'platzi',
    interval: 5000,
    mqtt: {
        host: 'mqtt://localhost'
    }
}

class IverseAgent extends EventEmitter {
    constructor (opts) {
        super ()
        this._options = defaults(opts, options)
        this._started = false
        this._timer = null
        this._client = null
        this._agentId = null
    }

    connect () {
        if (!this._started) {
            const opts = this._options
            this._client = mqtt.connect(opts.mqtt.host)
            this._started = true

            this._client.subscribe('agent/message')
            this._client.subscribe('agent/connected')
            this._client.subscribe('agent/disconnected')

            this._client.on('connect', () => {
                this._agentId = uuid.v4()
                this.emit('connected')
                this._timer = setInterval(() => {
                    this.emit('agent/message', 'this is a message')
                }, this._options.interval)
            })
            this._client.on('message', (topic, payload) => {
                payload = parsePayload(payload)
            })
            this._client.on('error', () => this.disconnect())
            this.emit('connected')
            this._timer = setInterval(() => {
                this.emit('agent/message', 'this is a message')
            }, this._options.interval)
        } 
    }

    disconnect () {
        if(this._started){
            clearInterval(this._timer)
            this._started = false
            this.emit('disconnected')
        }
    } 
}

module.exports = IverseAgent