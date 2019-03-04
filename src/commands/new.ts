import {Command, flags} from '@oclif/command'
import * as dayjs from 'dayjs'
import * as fs from 'fs-extra'
import * as _get from 'lodash.get'
import * as path from 'path'
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

  static args = [{name: 'project'}]

  async run() {
    const {args} = this.parse(New)
    // 2015-06-01 event "location" "New York, USA"
    // 获取用户配置 数据中的 repo
    const configFilePath = path.join(this.config.configDir, 'config.json')
    const userConfig = await fs.readJSON(configFilePath, {throws: false})
    const repoDir = _get(userConfig, 'repo', null)
    if (!repoDir) {
      this.error('请在配置文件中填写项目repo: ' + configFilePath)
    }
    await fs.ensureDir(repoDir)
    // 判断是否有 今日 格式为 YYYY-mm-dd 的数据文件
    const filePath = path.join(repoDir, dayjs().format('YYYY-MM-DD') + '.csv')
    await fs.ensureFile(filePath)
    // const fileData = await fs.readJSON(filePath, {throws: false})
    const writeData = `${dayjs().format('YYYY-MM-DD HH:mm:ss')},${args.project}\n`
    // 数据文件尾部写入 将要进行的项目 args.project
    await fs.appendFile(filePath, writeData)
    this.log(`Successful writing ${writeData}`)
  }
}
