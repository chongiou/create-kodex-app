import { getCurrentRenderContext, onCleanup } from "@zdjl/kodex"
import { FileWatcher } from "./FileWatcher"

declare const zdjl: any

/**
 * 监听文件变化并重启脚本
 * @param filename 文件名
 * @param remote 是否使用远程更新
 * @param interval 轮询间隔
 */
export const reloadHelper = (filename: string, remote?: boolean, interval: number = 200) => {
  const filepath = remote ? `/sdcard/自动精灵/.config/UnsaveEditing_${filename}` : `/sdcard/自动精灵/${filename}`
  const watcher = new FileWatcher(filepath, interval)
  watcher.start(() => {
    watcher.stop()
    getCurrentRenderContext().closeDialog()
    zdjl.runActionAsync(
      {
        type: "执行脚本",
        continueCurrentAfterFinish: false,
        filePath: filename
      }
    )
  })
  onCleanup(() => {
    watcher.stop()
  })
}

export default reloadHelper
