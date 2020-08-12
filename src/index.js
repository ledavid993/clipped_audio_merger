#!/usr/bin / env node
/* eslint-disable prettier*/
const chokidar = require('chokidar')
import { Main } from './MainClass'
import { awsConfig } from './aws.config'
import { Polly } from './PollyClass'
import colors from 'colors'
const { prompt } = require('enquirer')
var fs = require('fs')

const polly = new Polly(awsConfig)
const main = new Main(polly)
let copied = {
  question: '',
  answer: '',
  filename: '',
}
let setDir = false
let useCopied = false

const watcher = chokidar.watch(
  'C:\\Users\\David\\Downloads\\temp-text',
  {
    ignored: /\.part$/, // ignore dotfiles
    persistent: true,
  },
)

watcher
  .on('change', (path) => {
    if (!setDir && copied.question !== '' && copied.answer !== '')
      return
    console.log(`File ${path} has been changed`.magenta)
    if (!copied.question) {
      console.log('Copied question'.green)
      fs.readFile(path, 'utf8', function (err, data) {
        if (err) throw err
        console.log(data)
        copied.question = data
      })
    } else if (!copied.answer) {
      console.log('Copied answer'.green)
      fs.readFile(path, 'utf8', function (err, data) {
        if (err) throw err
        console.log(data)
        copied.answer = data
      })
      useCopied = true
    }
  })
  .on('unlink', (path) => {
    console.log(`File ${path} has been removed`.yellow)
    useCopied = false
    copied = {
      question: '',
      answer: '',
      filename: '',
    }
  })

async function run() {
  try {
    setDir = true

    console.log('Copy something... waiting on you...'.cyan)

    function sleep() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 500)
      })
    }

    while (!useCopied) {
      await sleep()
    }

    const questions = [
      {
        type: 'text',
        name: 'question',
        message: 'What is the question?',
        skip: useCopied,
      },
      {
        type: 'text',
        name: 'answer',
        message: 'What is the answer?',
        skip: useCopied,
      },
      {
        type: 'text',
        name: 'filename',
        message: 'What is the filename?',
        skip: useCopied,
      },
    ]

    const response = await prompt(questions)

    if (
      (response.question === '' && copied.question === '') ||
      (copied.answer === '' && response.answer === '')
    ) {
      throw Error('Please enter a question and an answer')
    }

    await main.getQnA(useCopied ? copied : response)
    await main.createQuestionMp3()
    await main.createAnswerMp3()
    await main.mergeFiles()
    await main.deleteTempFiles().then(() => {
      console.log('deleted temp files'.green)
      console.log('-------------------------------------')
      setTimeout(() => {
        run()
      }, 1000)
    })
  } catch (err) {
    console.log('No Reponse was entered'.red)
    run()
  }
}

main.initialPrompt().then(() => run())
