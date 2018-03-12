'use strict'

const agentFixture = require('./agent')
const metric = {
  type: 'web',
  value: '134',
  agentId: agentFixture.single.id,
  createdAt: new Date()
}

const metrics = [
  metric,
  extend(metric, {type: 'app'}),
  extend(metric, {agentId: 2}),
  extend(metric, {value: '128'}),
  extend(metric, {type: 'app', value: '130', agentId: 2}),
  extend(metric, {type: 'app', agentId: 2}),
  extend(metric, {type: 'soap'}),
  extend(metric, {type: 'casa'})
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}
module.exports = {
  single: metric,
  all: metrics,
  findUuid: uuid => {
    let types = metrics.filter(m => m.agentId === agentFixture.byUuid(uuid).id).map((item, i) => item.type)
    return types.filter((elem, pos) => types.indexOf(elem) === pos)
  },
  findTypeAgentUuid: (type, uuid) => metrics.filter(m => m.type === type && m.agentId === agentFixture.byUuid(uuid).id).sort((a, b) => new Date(b.date) - new Date(a.date))
}