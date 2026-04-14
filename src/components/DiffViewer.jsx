import { useEffect, useRef } from 'react'
import { createPatch, diffLines, diffChars } from 'diff'
import { html as diff2htmlHtml } from 'diff2html'
import 'diff2html/bundles/css/diff2html.min.css'

function CharDiffViewer({ left, right }) {
  const rows = []
  const changes = diffLines(left, right)
  let leftNum = 1
  let rightNum = 1
  let i = 0

  while (i < changes.length) {
    const change = changes[i]

    if (!change.added && !change.removed) {
      const lines = change.value.replace(/\n$/, '').split('\n')
      for (const line of lines) {
        rows.push({ type: 'unchanged', leftNum: leftNum++, rightNum: rightNum++, left: line, right: line, chars: null })
      }
    } else if (change.removed) {
      const removedLines = change.value.replace(/\n$/, '').split('\n')
      let addedLines = []
      if (i + 1 < changes.length && changes[i + 1].added) {
        addedLines = changes[i + 1].value.replace(/\n$/, '').split('\n')
        i++
      }
      const maxLen = Math.max(removedLines.length, addedLines.length)
      for (let j = 0; j < maxLen; j++) {
        const l = j < removedLines.length ? removedLines[j] : null
        const r = j < addedLines.length ? addedLines[j] : null
        const chars = l !== null && r !== null ? diffChars(l, r) : null
        rows.push({ type: 'changed', leftNum: l !== null ? leftNum++ : null, rightNum: r !== null ? rightNum++ : null, left: l, right: r, chars })
      }
    } else if (change.added) {
      const lines = change.value.replace(/\n$/, '').split('\n')
      for (const line of lines) {
        rows.push({ type: 'added', leftNum: null, rightNum: rightNum++, left: null, right: line, chars: null })
      }
    }
    i++
  }

  return (
    <div className="char-diff">
      <table className="char-diff-table">
        <colgroup>
          <col className="char-diff-numcol" />
          <col />
          <col className="char-diff-numcol" />
          <col />
        </colgroup>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className={`char-row-${row.type}`}>
              <td className="char-num">{row.leftNum ?? ''}</td>
              <td className="char-code char-left">
                {row.left !== null && (row.chars
                  ? row.chars.filter(p => !p.added).map((p, k) =>
                      p.removed
                        ? <mark key={k} className="char-hl-del">{p.value}</mark>
                        : <span key={k}>{p.value}</span>
                    )
                  : row.left || ' '
                )}
              </td>
              <td className="char-num">{row.rightNum ?? ''}</td>
              <td className="char-code char-right">
                {row.right !== null && (row.chars
                  ? row.chars.filter(p => !p.removed).map((p, k) =>
                      p.added
                        ? <mark key={k} className="char-hl-ins">{p.value}</mark>
                        : <span key={k}>{p.value}</span>
                    )
                  : row.right || ' '
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DiffViewer({ left, right, viewType, fileName }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (viewType === 'char' || !containerRef.current) return

    const patch = createPatch(fileName || 'file', left, right, '', '')
    const rendered = diff2htmlHtml(patch, {
      drawFileList: false,
      matching: 'lines',
      outputFormat: viewType === 'side-by-side' ? 'side-by-side' : 'line-by-line',
    })
    containerRef.current.innerHTML = rendered
  }, [left, right, viewType, fileName])

  if (viewType === 'char') {
    return <CharDiffViewer left={left} right={right} />
  }

  return <div className="diff-output" ref={containerRef} />
}
