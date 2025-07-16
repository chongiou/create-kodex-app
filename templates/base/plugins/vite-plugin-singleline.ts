import { Plugin } from 'vite'

interface Options {
  skipFile?: string[]
}

export function singleLinePlugin(options: Options = {}): Plugin {
  return {
    name: 'vite:singleline-output',
    generateBundle(_options, bundle) {
      for (const [fileName, bundleInfo] of Object.entries(bundle)) {
        if (options.skipFile && options.skipFile.includes(fileName)) {
          continue
        }

        const code = (bundleInfo as any).code as string
        const res = minifyCodeFast(code)
        // @ts-expect-error
        bundleInfo.code = res
      }
    }
  }
}

function minifyCodeFast(code: string): string {
  // 用数组存储所有字符串和正则表达式的位置
  const protectedRanges: Array<{ start: number; end: number }> = []

  // 找到所有需要保护的字符串
  findStringRanges(code, protectedRanges)

  // 创建一个掩码，标记哪些字符需要保护
  const mask = new Array(code.length).fill(false)
  protectedRanges.forEach(range => {
    for (let i = range.start; i <= range.end; i++) {
      mask[i] = true
    }
  })

  // 使用正则表达式批量处理，但跳过保护区域
  let result = ''
  let lastIndex = 0

  // 分段处理代码
  for (let i = 0; i < code.length; i++) {
    if (mask[i]) {
      // 遇到保护区域，先处理之前的代码
      if (i > lastIndex) {
        const segment = code.slice(lastIndex, i)
        result += processSegment(segment)
      }

      // 找到保护区域的结束位置
      while (i < code.length && mask[i]) {
        result += code[i]
        i++
      }
      i-- // 回退一个位置，因为循环会自动 i++
      lastIndex = i + 1
    }
  }

  // 处理最后一段
  if (lastIndex < code.length) {
    const segment = code.slice(lastIndex)
    result += processSegment(segment)
  }

  return result
}

function findStringRanges(code: string, ranges: Array<{ start: number; end: number }>) {
  // 匹配字符串的正则表达式
  const stringRegex = /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g
  let match

  while ((match = stringRegex.exec(code)) !== null) {
    ranges.push({
      start: match.index,
      end: match.index + match[0].length - 1
    })
  }

  // 简单的正则表达式检测（匹配 /.../ 形式，不在字符串内）
  const regexRegex = /\/(?![*/])([^\/\r\n\\]|\\.)+\/[gimuy]*/g
  regexRegex.lastIndex = 0

  while ((match = regexRegex.exec(code)) !== null) {
    // 检查是否已经在保护范围内
    const isInProtected = ranges.some(range =>
      match.index >= range.start && match.index <= range.end
    )

    if (!isInProtected && isRegexContext(code, match.index)) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length - 1
      })
    }
  }

  // 按位置排序
  ranges.sort((a, b) => a.start - b.start)
}

function processSegment(segment: string): string {
  return segment
    .replace(/\/\*[\s\S]*?\*\//g, '')     // 移除多行注释
    .replace(/\/\/.*$/gm, '')             // 移除单行注释
    .replace(/\n/g, '')                   // 移除换行
    .replace(/\s{2,}/g, ' ')              // 多余空格压成一个
    .replace(/\s*([=,\(\)\{\};:<>])\s*/g, '$1')  // 去除运算符空格
    .replace(/\s*$/, '')                  // 移除末尾空格
}

function isRegexContext(code: string, pos: number): boolean {
  // 检查正则表达式前的上下文
  const before = code.slice(0, pos).replace(/\s+$/, '')
  const regexPrefixes = ['=', '(', '[', ',', ':', ';', '!', '&', '|', '?', '+', '-', '*', '/', '%', '<', '>', '^', '~', '{', 'return', 'throw']

  return regexPrefixes.some(prefix => before.endsWith(prefix))
}

export default singleLinePlugin
