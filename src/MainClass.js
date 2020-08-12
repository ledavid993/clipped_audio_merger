import path from 'path'
import fs from 'fs'
const { prompt } = require('enquirer')
const NodeID3 = require('node-id3')
const nodeHtmlToImage = require('node-html-to-image')
import htmlString from './htmlString'

class Main {
  constructor(pollyInstance) {
    this.response = null
    this.polly = pollyInstance
    this.basePath = null
    this.copied = false
    this.rawResponse = null
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

  async formatResponse(response) {
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

    return await {
      filename:
        response.filename?.length !== 0
          ? response.filename
          : today + time,
      question: `<speak>${response.question}<break time="1s"/></speak>`,
      answer: `<speak>${response.answer}<break time="1s"/></speak>`,
    }
  }

  async getQnA(response) {
    this.rawResponse = response
    this.response = await this.formatResponse(response)
  }

  writeImageToDisk(type, image) {
    return new Promise((resolve, reject) => {
      let data = image.replace(/^data:image\/\w+;base64,/, '')
      let buf = new Buffer(data, 'base64')
      fs.writeFile(
        path.join(
          __dirname,
          `../temp/${this.response.filename}.${type}.jpg`,
        ),
        buf,
        function (err) {
          if (err) {
            console.log(err)
            reject()
          }
          resolve()
          console.log(
            `Finishing converting text of ${type} to image`.green,
          )
        },
      )
    })
  }

  async convertTextToImage() {
    console.log('Converting text to image...'.yellow)
    let updateHtmlString = await htmlString.replace(
      /%answer%/gi,
      this.rawResponse.answer,
    )
    updateHtmlString = await updateHtmlString.replace(
      /%question%/gi,
      this.rawResponse.question,
    )

    await nodeHtmlToImage({
      output: path.join(
        __dirname,
        `../temp/${this.response.filename}.png`,
      ),
      html: updateHtmlString,
    })
    console.log('Text image task finish.'.green)
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

  async updateMp3Meta() {
    console.log('Updating meta to add text...'.yellow)
    const file = path.join(
      __dirname,
      `../temp/${this.response.filename}.question.mp3`,
    )
    let tags = {
      APIC: path.join(
        __dirname,
        `../temp/${this.response.filename}.png`,
      ),
    }
    await NodeID3.write(tags, file)
    console.log('Completed updating meta of adding text...'.green)
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
