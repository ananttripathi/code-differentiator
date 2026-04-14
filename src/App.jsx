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
              <h1 className="header-title">DiffLens</h1>
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
              <button
                className={`toggle-btn${viewType === 'char' ? ' active' : ''}`}
                onClick={() => setViewType('char')}
              >
                Char Diff
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
        <p className="footer-privacy">Runs entirely in your browser — no data is sent to any server</p>
        <div className="footer-author">
          <span>Built by <a href="https://ananttripathi.github.io/Anant-Portfolio/" target="_blank" rel="noopener noreferrer" className="footer-name">Anant Tripathi</a></span>
          <span className="footer-divider">·</span>
          <div className="footer-socials">
            {/* LinkedIn */}
            <a href="https://linkedin.com/in/ananttripathiak" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            {/* GitHub */}
            <a href="https://github.com/ananttripathi" target="_blank" rel="noopener noreferrer" title="GitHub" className="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            </a>
            {/* Portfolio */}
            <a href="https://ananttripathi.github.io/Anant-Portfolio/" target="_blank" rel="noopener noreferrer" title="Portfolio" className="social-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </a>
            {/* Kaggle */}
            <a href="https://www.kaggle.com/anantkumartripathi" target="_blank" rel="noopener noreferrer" title="Kaggle" className="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.285.18.046.149.034.255-.036.315l-6.555 6.344 6.836 8.507c.095.104.117.208.07.334"/></svg>
            </a>
            {/* HuggingFace */}
            <a href="https://huggingface.co/ananttripathiak" target="_blank" rel="noopener noreferrer" title="Hugging Face" className="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 2c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm-3.5 5.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5S10 10.828 10 10s-.672-1.5-1.5-1.5zm7 0c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zM12 13c-2.21 0-4 1.343-4 3h8c0-1.657-1.79-3-4-3z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
