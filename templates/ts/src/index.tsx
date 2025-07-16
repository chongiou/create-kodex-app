import { createSignal, render, Row, type CommonProps } from "@zdjl/kodex"
import { reloadHelper } from '#/scripts/reloadHelper'

type Style<E extends keyof JSX.IntrinsicElements = string> = CommonProps['style'] & JSX.IntrinsicElements[E]['style']

const App = () => {
  if (import.meta.env.MODE === 'test') {
    // ⚠️: 在某些高版本 Android 上, reloadHelper 可能不起作用, 甚至可能有奇怪的 bug。该代码块在构建生产版本后被移除, 所使用的函数变量等也不会被打包, 它仅在开发阶段起作用
    // 
    // 实验性: 打开该注释可以在文件更改时自动重启当前脚本, 有时候效果并不好, 因此没有默认启用
    // reloadHelper('{{package-name}}.zjs')
  }

  const [count, setCount] = createSignal(0)

  const style = {
    align: 'center',
    fontColor: '#00ccff',
    bgColor: '#3b4c50'
  } as Style<'text'>

  return (
    <>
      <text style={style}>Count is {count}</text>
      <Row justify='space-around'>
        <button onClick={() => setCount(prev => prev - 1)}>Count - 1</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(prev => prev + 1)}>Count + 1</button>
      </Row>
    </>
  )
}

const app = render(<App />)

if (typeof zdjl !== 'undefined') {
  const result = await app.show()
  zdjl.alert(JSON.stringify(result.input, null, 2))
} else {
  console.dir(app.vars, { depth: null })
}
