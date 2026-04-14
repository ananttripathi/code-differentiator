import { useEffect, useRef } from 'react'
import { createPatch } from 'diff'
import { Diff2Html } from 'diff2html'
import 'diff2html/bundles/css/diff2html.min.css'

export default function DiffViewer({ left, right, viewType, fileName }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const patch = createPatch(fileName || 'file', left, right, '', '')
    const html = Diff2Html.html(patch, {
      drawFileList: false,
      matching: 'lines',
      outputFormat: viewType === 'side-by-side' ? 'side-by-side' : 'line-by-line',
    })
    containerRef.current.innerHTML = html
  }, [left, right, viewType, fileName])

  return <div className="diff-output" ref={containerRef} />
}
