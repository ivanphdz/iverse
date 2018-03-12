'use strict'

const db = require('../')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'iverse',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'admin',
    host: process.env.DB_HOST || 'localhost',
    port: 5433,
    dialect: 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  console.log('--agent--')
  console.log(agent)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  console.log('--metrics--')
  console.log(metrics)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}

run()
