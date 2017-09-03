# iverse-db

#usage

const setupDatabase = require ('platziverse-db')

setupDatabase(config).then(db => {
    const Metric = db.Metric
    const Agent = db.Agent
}).catch(err =>  console.error(err))