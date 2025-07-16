#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import prompts from 'prompts'
import { execSync } from 'node:child_process'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  console.log(chalk.cyan('\n✨ 欢迎使用 Kodex 项目脚手架！\n'))

  const { projectName, variant } = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: '请输入项目名称：',
      initial: 'my-kodex-app',
    },
    {
      type: 'select',
      name: 'variant',
      message: '请选择语言模板：',
      choices: [
        { title: 'TypeScript', value: 'ts' },
        { title: 'JavaScript', value: 'js' },
      ],
    }
  ])

  const targetDir = path.resolve(process.cwd(), projectName)
  const pathExist = await fs.pathExists(targetDir)
  const baseTemplate = path.resolve(__dirname, '../templates/base')
  const variantTemplate = path.resolve(__dirname, `../templates/${variant}`)

  if (pathExist) {
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow('警告: 目录已存在, 是否继续')
    })
    if (!confirm) {
      console.log(chalk.gray('退出'))
      process.exit(0)
    }
  }

  console.log(chalk.gray('\n📁 创建项目目录中...'))

  await fs.copy(baseTemplate, targetDir)
  await fs.copy(variantTemplate, targetDir)

  const packageFilepath = `${targetDir}/package.json`, indexFilepath = `${targetDir}/src/index.${variant}x`
  // 修改 package.json
  const packageFileContent = await fs.readFile(packageFilepath, { encoding: 'utf-8' })
  await fs.writeFile(packageFilepath, packageFileContent.replaceAll('{{package-name}}', projectName))
  // 修改 index
  const indexFileContent = await fs.readFile(indexFilepath, { encoding: 'utf-8' })
  await fs.writeFile(indexFilepath, indexFileContent.replaceAll('{{package-name}}', projectName))


  // 检测包管理器
  const { pkg } = await prompts({
    type: 'select',
    name: 'pkg',
    message: '请选择包管理器：',
    choices: [
      { title: 'npm', value: 'npm' },
      // { title: 'yarn', value: 'yarn' },
      // { title: 'pnpm', value: 'pnpm' },
    ]
  })

  // console.log(chalk.gray('\n📦 正在安装依赖，请稍等...'))

  // execSync(`${pkg} install`, {
  //   cwd: targetDir,
  //   stdio: 'inherit',
  // })

  console.log(chalk.green(`\n🎉 项目创建成功! 接下来:\t${chalk.gray('更多请查看 package.json scripts')}\n`))
  console.log(`进入项目文件夹:`)
  console.log(chalk.cyan(`   cd ${projectName}`))
  console.log(`安装依赖:`)
  console.log(chalk.cyan(`   ${pkg} install`))
  console.log(`构建用于测试的脚本:`)
  console.log(chalk.cyan(`   ${pkg} run test:build`))
  console.log(`推送到本地安卓设备:\t${chalk.gray('如果你已经安装了 adb, 并且设备正在运行')}`)
  console.log(chalk.cyan(`   ${pkg} run test:push`))
  console.log(`持续监听文件并重新构建和推送:`)
  console.log(chalk.cyan(`   ${pkg} run test:watch`))
  console.log(`构建用于生产的脚本:`)
  console.log(chalk.cyan(`   ${pkg} run build`))
}

main().catch(err => {
  console.error(chalk.red('出错了：'), err)
})
