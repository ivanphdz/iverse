'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

let config = {
  database: process.env.DB_NAME || 'iverse',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'admin',
  host: process.env.DB_HOST || 'localhost',
  port: 5433,
  dialect: 'postgres',
  setup: false
}

let AgentStub = {
  hasMany: sinon.spy()
}

let MetricStub = null
let db = null
let sandbox = null
let uuid = 'yyy-yyy-yyy'
let type = 'app'

let newMetric = {
    type: 'CPU',
    value: '23%'
}

let uuidArgs = {
    where: {
        uuid
    }
}

test.beforeEach(async () => {
    sandbox = sinon.sandbox.create()
  
    MetricStub = {
      belongsTo: sandbox.spy()
    }
  
    // Model create Stub
    MetricStub.create = sandbox.stub()
    MetricStub.create.withArgs(uuid, newMetric).returns(Promise.resolve(newMetric ))
    MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
        toJSON() { return newMetric }
    }))

    // Agent findOne Stub
    AgentStub.findOne = sandbox.stub()
    AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.single))

    
    const setupDatabase = proxyquire('../index', {
      './models/agent': () => AgentStub,
      './models/metric': () => MetricStub
    })
    db = await setupDatabase(config)
  })
  
  test.afterEach(() => {
    sandbox && sinon.sandbox.restore()
  })
  
test('Metric', t => {
  t.truthy(db.Metric, 'Agent service should exit')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the metricStub')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument agentStub')
})

test.serial('Metric#create', async t => {
  let metric = await db.Metric.create(uuid, newMetric)
  t.deepEqual(metric, newMetric, 'should be the same')
})