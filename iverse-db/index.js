'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const setupAgent = require('./lib/agent')
const setupMetric = require('./lib/metric')
// const defaults = require('defaults')

// config = defaults(config, {
    // dialect: 'sqlite',
    // pool: {
     // max: 10,
      // min: 0,
      // idle: 10000
    // },
    // query: {
      // raw: true
    // }
  // })
module.exports = async function (config) {
  const Sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  await Sequelize.authenticate()

  if (config.setup) {
    await Sequelize.sync({ force: true })
  }

  const Agent = setupAgent(AgentModel)
  const Metric = setupMetric(MetricModel, AgentModel)

  return {
    Agent: Agent,
    Metric: Metric
  }
}
