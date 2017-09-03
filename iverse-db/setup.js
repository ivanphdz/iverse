'use strict'

const debug = require('debug')('iverse:db')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./index')

const prompt = inquirer.createPromptModule()
async function setup () {
  const answer = await prompt([
      {
          type: 'confirm',
          name: 'setup',
          message: 'This will destroy your database, are you sure?'
      }
  ])
  if(!answer.setup) {
      return console.log('Nothing happened :)')
  }
  const config = {
    database: process.env.DB_NAME || 'iverse',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'admin',
    host: process.env.DB_HOST || 'localhost',
    port: 5433,
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }
  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
