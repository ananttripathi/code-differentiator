import { useState, useMemo } from 'react'
import { createPatch } from 'diff'
import InputPane from './components/InputPane'
import DiffViewer from './components/DiffViewer'
import './App.css'

export default function App() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [leftFile, setLeftFile] = useState(null)
  const [rightFile, setRightFile] = useState(null)
  const [viewType, setViewType] = useState('side-by-side')
  const [compared, setCompared] = useState(false)
  const [diffSnapshot, setDiffSnapshot] = useState(null)
  const [dark, setDark] = useState(false)

  const isEmpty = left.trim() === '' && right.trim() === ''

  const stats = useMemo(() => {
    if (!compared || !diffSnapshot) return null
    const patch = createPatch(
      diffSnapshot.fileName,
      diffSnapshot.left,
      diffSnapshot.right,
      '',
      ''
    )
    let added = 0
    let removed = 0
    for (const line of patch.split('\n')) {
      if (line.startsWith('+') && !line.startsWith('+++')) added++
      else if (line.startsWith('-') && !line.startsWith('---')) removed++
    }
    return { added, removed }
  }, [compared, diffSnapshot])

  function handleLeftChange(text) {
    setLeft(text)
    setCompared(false)
  }

  function handleRightChange(text) {
    setRight(text)
    setCompared(false)
  }

  function handleCompare() {
    const fileName = leftFile || rightFile || 'file'
    setDiffSnapshot({ left, right, fileName })
    setCompared(true)
  }

  function handleClear() {
    setLeft('')
    setRight('')
    setLeftFile(null)
    setRightFile(null)
    setCompared(false)
    setDiffSnapshot(null)
  }

  function handleSwap() {
    setLeft(right)
    setRight(left)
    setLeftFile(rightFile)
    setRightFile(leftFile)
    setCompared(false)
  }

  return (
    <div className="app" data-theme={dark ? 'dark' : 'light'}>
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
            <div>
              <h1 className="header-title">DiffTool</h1>
              <p className="header-subtitle">Code &amp; text differentiator</p>
            </div>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setDark(d => !d)}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="input-section">
          <InputPane
            label="Original"
            value={left}
            onChange={handleLeftChange}
            onFile={(name) => { setLeftFile(name); setCompared(false) }}
          />

          <div className="swap-col">
            <button className="swap-btn" onClick={handleSwap} title="Swap sides">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <InputPane
            label="Modified"
            value={right}
            onChange={handleRightChange}
            onFile={(name) => { setRightFile(name); setCompared(false) }}
          />
        </div>

        <div className="controls-bar">
          <div className="controls-left">
            <button
              className="btn btn-primary"
              onClick={handleCompare}
              disabled={isEmpty}
            >
              Compare
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleClear}
              disabled={isEmpty}
            >
              Clear
            </button>
          </div>

          <div className="controls-right">
            {compared && stats && (
              <div className="stats-badge">
                <span className="stat-added">+{stats.added}</span>
                <span className="stat-removed">-{stats.removed}</span>
                <span className="stat-label">lines changed</span>
              </div>
            )}
            <div className="view-toggle">
              <button
                className={`toggle-btn${viewType === 'side-by-side' ? ' active' : ''}`}
                onClick={() => setViewType('side-by-side')}
              >
                Side by Side
              </button>
              <button
                className={`toggle-btn${viewType === 'unified' ? ' active' : ''}`}
                onClick={() => setViewType('unified')}
              >
                Unified
              </button>
            </div>
          </div>
        </div>

        <div className="diff-section">
          {compared && diffSnapshot ? (
            <DiffViewer
              left={diffSnapshot.left}
              right={diffSnapshot.right}
              viewType={viewType}
              fileName={diffSnapshot.fileName}
            />
          ) : (
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="8" width="24" height="48" rx="3" />
                <rect x="36" y="8" width="24" height="48" rx="3" />
                <line x1="10" y1="20" x2="22" y2="20" />
                <line x1="10" y1="27" x2="22" y2="27" />
                <line x1="10" y1="34" x2="18" y2="34" />
                <line x1="42" y1="20" x2="54" y2="20" />
                <line x1="42" y1="27" x2="50" y2="27" />
                <line x1="42" y1="34" x2="54" y2="34" />
                <line x1="42" y1="41" x2="48" y2="41" />
              </svg>
              <p className="empty-text">
                Paste code or upload files above, then click Compare
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Runs entirely in your browser — no data is sent to any server</p>
      </footer>
    </div>
  )
}
