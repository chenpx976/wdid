import {Command, flags} from '@oclif/command'
// import * as csv from 'csv-parser'
import * as dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 按需加载
import * as glob from 'fast-glob'
import * as fs from 'fs-extra'
import * as _get from 'lodash.get'
import * as path from 'path'

dayjs.locale('zh-cn') // 全局使用西班牙语

export default class New extends Command {
  static description = '创建一条新的活动'

  static examples = [
    `$ wdid new working on xx
Successful writing
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [
    {
      name: 'type',
      default: 'today',
      options: ['today', 'week'],
    }
  ]

  async run() {
    const {args} = this.parse(New)
    // 获取用户配置 数据中的 repo
    const configFilePath = path.join(this.config.configDir, 'config.json')
    const userConfig = await fs.readJSON(configFilePath, {throws: false})
    const repoDir = _get(userConfig, 'repo', null)
    if (!repoDir) {
      this.error('请在配置文件中填写项目repo: ' + configFilePath)
    }
    await fs.ensureDir(repoDir)
    let start = dayjs().add(-1, 'day')
    let end = dayjs()
    if (args.type === 'week') {
      start = dayjs().startOf('week')
      end = dayjs().endOf('week')
    }
    // this.log(start)
    // this.log(end)
    const fileList = glob.sync('*.csv', {
      cwd: repoDir,
    }).filter(item => {
      const date = item.split('.')[0]
      return dayjs(date).isAfter(start) && dayjs(date).isBefore(end)
    })
    // const fileList = await fs.readdir(repoDir)
    // console.log(start.format('YYYY-MM-DD'), fileList)
    const fileData = fileList.reduce((pre, cur) => {
      const filePath = path.join(repoDir, cur)
      const fileData = fs.readFileSync(filePath).toString()
      return `${pre}${cur}\n${fileData}`
    }, '')
    this.log(fileData)
  }
}
