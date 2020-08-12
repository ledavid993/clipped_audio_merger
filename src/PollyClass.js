import AWS from 'aws-sdk'
import fs from 'fs'
import path from 'path'
const mkdirp = require('mkdirp')
import colors from 'colors'
var archiver = require('archiver')

class Polly {
  constructor(config) {
    this.config = config
    this.Polly = new AWS.Polly(config)
    this.questionMp3Path = 'nothing'
    this.answerMp3Path = 'default'
  }

  generateMp3(input, filepath) {
    return new Promise((resolve, reject) => {
      this.Polly.synthesizeSpeech(input, async (err, data) => {
        if (err) {
          console.log(err)
        }
        if (data.AudioStream instanceof Buffer) {
          fs.writeFile(filepath, data.AudioStream, (fserr) => {
            if (fserr) {
              console.log(fserr)
              reject()
            }
            resolve()
            console.log('Success'.green)
          })
        }
      })
    })
  }

  async getQuestionsMp3(input, name) {
    this.questionMp3Path = path.join(
      __dirname,
      `../temp/${name}.question.mp3`,
    )

    await this.generateMp3(input, this.questionMp3Path)
  }

  async getAnswerMp3(input, name) {
    this.answerMp3Path = path.join(
      __dirname,
      `../temp/${name}.answer.mp3`,
    )

    await this.generateMp3(input, this.answerMp3Path)
  }

  async mergeMp3(filename, baseName) {
    const dir = path.join(__dirname, `../${baseName}`)
    console.log(dir.blue)

    fs.mkdirSync(dir, { recursive: true })

    return new Promise((resolve, reject) => {
      var output = fs.createWriteStream(
        path.join(dir, `${filename}.mp3`),
      )
      var archive = archiver('zip', {
        zlib: { level: 0 }, // Sets the compression level.
      })

      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes')
        console.log(
          'archiver has been finalized and the output file descriptor has closed.',
        )
        resolve()
      })

      output.on('end', function () {
        console.log('Data has been drained')
      })

      archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
          // log warning
        } else {
          // throw error
          throw err
        }
      })

      archive.pipe(output)

      archive.append(fs.createReadStream(this.questionMp3Path), {
        name: `1${filename}.question.mp3`,
      })

      archive.append(fs.createReadStream(this.answerMp3Path), {
        name: `2${filename}.answer.mp3`,
      })

      archive.finalize()
    })
  }
}

export { Polly }
