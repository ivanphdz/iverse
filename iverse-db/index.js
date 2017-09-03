'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')

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

  const Agent = {}
  const Metric = {}

  return {
    Agent: Agent,
    Metric: Metric
  }
}
