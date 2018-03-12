'use strict'

const debug = require('debug')('iverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('iverse-db')
const { parsePayload } = require('./utils.js')

const backend = {
    type: 'redis',
    redis,
    return_buffers: true
}

const settings = {
    port: 1883,
    backend
}

const config = {
    database: process.env.DB_NAME || 'iverse',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'admin',
    host: process.env.DB_HOST || 'localhost',
    port: 5433,
    dialect: 'postgres',
    logging: s => debug(s),
    setup: false
  }

const server = new mosca.Server(settings)
const clients = new Map()
let Agent, Metric

server.on('clientConnected', client => {
    debug(`Client connected: ${client.id}`)
    clients.set(client.id, null)
})

server.on('clientDisconnected', async client => {
    debug(`Client disconnected: ${client.id}`)
    const agent = clients.get(client.id)

    if(agent) {
        // Mark agent as Disconnected
        agent.connected = false
        try {
           await Agent.createOrUpdate(agent) 
        } catch (e) {
           return handleError(e) 
        }
        // Delete Agent from Clients List
        clients.delete(clients.id)   
        
        server.publish({
            topic: 'agent/disconnected',
            payload: JSON.stringify({
                agent: {
                    uuid: agent.uuid
                }
            })
        })
        debug(`Client (${client.id}) associated to Agent (${agent.uuid})`)
    }
})

server.on('published',async (packet, client) => {
    debug(`Received: ${packet.topic}`)
    switch(packet.topic){
        case 'agent/connected':
        case 'agent/disconnected':
            debug(`Payload: ${packet.payload}`)
            break
        case 'agent/message':
            debug(`Payload: ${packet.payload}`)
            const payload = parsePayload(packet.payload)

            if ( payload ) {
                payload.agent.connected = true

                let agent
                try {
                    agent = await Agent.createOrUpdate(payload.agent)
                } catch (e){
                    return handleError(e)
                }
                debug(`Agent ${agent.uuid} saved`)

                // Notify Agent is Connected
                if(!clients.get(client.id)) {
                    clients.set(client.id, agent)
                    server.publish({
                        topic: 'agent/connected',
                        payload: JSON.stringify({
                           agent: {
                               uuid: agent.uuid,
                               name: agent.name,
                               hostname: agent.hostname,
                               pid: agent.pid,
                               connected: agent.connected
                           } 
                        })
                    })
                }

                // Store Metrics
                for (let metric of payload.metrics) {
                    let m

                    try {
                        m = await Metric.create(agent.uuid, metric)
                    } catch (e) {
                        return handleError(e)
                    }
                    debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
                }
            }
            break
    }

    
})

server.on('ready', async () => {
    const services = await db(config).catch(handleFatalError)
    Agent = services.Agent
    Metric = service.Metric
    console.log(`${chalk.green('[iverse-mqtt]')} server is running`)
})

server.on('error', handleFatalError)

function handleFatalError (err) {
    console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
}

function handleError (err) {
    console.error(`${chalk.red('[Error]')} ${err.message}`)
    console.error(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandleRejection', handleFatalError)