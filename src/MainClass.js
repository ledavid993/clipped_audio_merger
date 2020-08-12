import path from 'path'
import fs from 'fs'
const { prompt } = require('enquirer')
const NodeID3 = require('node-id3')
const nodeHtmlToImage = require('node-html-to-image')
import htmlString from './htmlString'
import { exit } from 'process'
import { grey } from 'colors'
const util = require('util')

class Main {
  constructor(pollyInstance) {
    this.response = null
    this.polly = pollyInstance
    this.basePath = null
    this.copied = false
    this.rawResponse = null
    this.debug = false
    this.readdir = util.promisify(fs.readdir)
    this.readFile = util.promisify(fs.readFile)
  }

  async initialPrompt() {
    const questions = [
      {
        type: 'text',
        name: 'base',
        message: 'Base dir name (optional)?',
        initial: '',
        skip: this.debug,
      },
      {
        type: 'text',
        name: 'sub',
        message: 'Sub directory name (optional)?',
        initial: '',
        skip: this.debug,
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
      question: `<speak><amazon:auto-breaths>Question${response.question}<break time="1s"/></amazon:auto-breaths></speak>`,
      answer: `<speak><amazon:auto-breaths>Answer${response.answer}<break time="1s"/></amazon:auto-breaths></speak>`,
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

  async convertImageToHtml() {
    let images = []
    try {
      images = await this.readdir(
        'C:\\Users\\David\\Downloads\\temp-pic',
      )
    } catch (err) {
      console.log(err)
    }

    return Promise.all(
      images
        .filter((file) => {
          if (file.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)) {
            return file
          }
        })
        .map(async (file) => {
          const filePath = `C:\\Users\\David\\Downloads\\temp-pic\\${file}`
          const fileext = path.extname(file).split('.').pop()
          try {
            const image = await this.readFile(filePath).then(
              (buf) => {
                const base64Image = new Buffer.from(buf).toString(
                  'base64',
                )
                return `data:image/${fileext};base64,` + base64Image
              },
            )
            return `<img style="height: 100%; width: 100%;" src='${image}'/>`
          } catch (e) {
            console.log(e)
          }
        }),
    ).then((res) => res.join(' '))
  }

  async updateHtmlWithImg() {
    let updateHtmlString = htmlString.replace(
      /%answer%/gi,
      this.rawResponse.answer,
    )
    updateHtmlString = updateHtmlString.replace(
      /%question%/gi,
      this.rawResponse.question,
    )
    const imagesTags = await this.convertImageToHtml()

    if (imagesTags.length !== 0) {
      updateHtmlString = updateHtmlString.replace(
        /%images%/gi,
        `<div class="left-container" style="
        display: grid;
        gap: 3px;
        grid-template-columns: auto auto;
        max-height: 1000px;
      ">${imagesTags}</div>`,
      )
    }

    return updateHtmlString
  }

  async convertTextToImage() {
    console.log('Converting text and images...'.yellow)

    await this.updateHtmlWithImg().then(async (updateHtmlString) => {
      await nodeHtmlToImage({
        output: path.join(
          __dirname,
          `../temp/${this.response.filename}.png`,
        ),
        html: updateHtmlString,
      })
      console.log('Text and images task finish.'.green)
    })
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

    const directory3 = 'C:\\Users\\David\\Downloads\\temp-pic'

    await fs.readdir(directory3, (err, files) => {
      if (err) throw err

      for (const file of files) {
        fs.unlink(path.join(directory3, file), (err) => {
          if (err) throw err
        })
      }
    })
  }
}

export { Main }
