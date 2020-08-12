import path from 'path'
import fs from 'fs'
const chokidar = require('chokidar')
const { prompt } = require('enquirer')

class Main {
  constructor(pollyInstance) {
    this.response = null
    this.polly = pollyInstance
    this.basePath = null
    this.copied = false
  }

  async initialPrompt() {
    const questions = [
      {
        type: 'text',
        name: 'base',
        message: 'Base dir name (optional)?',
      },
      {
        type: 'text',
        name: 'sub',
        message: 'Sub directory name (optional)?',
      },
    ]

    const response = await prompt(questions)

    this.copied = true

    let base = response.base ? '/' + response.base : ''
    let sub = response.sub ? '/' + response.sub : ''
    this.basePath = 'audio' + base + sub
  }

  formatResponse(response) {
    var date = new Date()
    var today =
      date.getFullYear() +
      '_' +
      (date.getMonth() + 1) +
      '_' +
      date.getDate()
    var time =
      date.getHours() +
      '_' +
      date.getMinutes() +
      '_' +
      date.getSeconds()

    return {
      filename:
        response.filename?.length !== 0
          ? response.filename
          : today + time,
      question: `<speak>${response.question}<break time="1s"/></speak>`,
      answer: `<speak>${response.answer}<break time="1s"/></speak>`,
    }
  }

  async getQnA(response) {
    this.response = this.formatResponse(response)
  }

  async createQuestionMp3() {
    const input = {
      Text: this.response?.question,
      OutputFormat: 'mp3',
      VoiceId: 'Salli',
      TextType: 'ssml',
    }

    console.log('generating mp3...')

    await this.polly
      .getQuestionsMp3(input, this.response.filename)
      .then(() => console.log('finished creating question mp3'))

    console.log('moving on to next step...'.yellow)
  }

  async createAnswerMp3() {
    const input = {
      Text: this.response?.answer,
      OutputFormat: 'mp3',
      VoiceId: 'Justin',
      TextType: 'ssml',
    }

    console.log('generating mp3...')

    await this.polly
      .getAnswerMp3(input, this.response.filename)
      .then(() => console.log('finished creating answer mp3'))

    console.log('moving on to next step...'.yellow)
  }

  async mergeFiles() {
    console.warn('Merging question and answer audio files')
    await this.polly.mergeMp3(this.response.filename, this.basePath)
    console.log('Merging completed'.green)
  }

  async deleteTempFiles() {
    const directory = path.join(__dirname, '../temp')
    await fs.readdir(directory, (err, files) => {
      if (err) throw err

      for (const file of files) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err
        })
      }
    })

    const directory2 = 'C:\\Users\\David\\Downloads\\temp-text'

    await fs.readdir(directory2, (err, files) => {
      if (err) throw err

      for (const file of files) {
        fs.unlink(path.join(directory2, file), (err) => {
          if (err) throw err
        })
      }
    })
  }
}

export { Main }
