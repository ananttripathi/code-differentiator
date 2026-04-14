import { useState, useRef } from 'react'
import { parseFile } from '../utils/parseFile'

export default function InputPane({ label, value, onChange, onFile }) {
  const [tab, setTab] = useState('paste')
  const [fileName, setFileName] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const placeholder =
    label === 'Original'
      ? 'Paste original code here...'
      : 'Paste modified code here...'

  async function handleFileLoad(file) {
    const text = await parseFile(file)
    setFileName(file.name)
    onChange(text)
    onFile(file.name)
  }

  function handleRemove() {
    setFileName(null)
    onChange('')
    onFile(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileLoad(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function handleInputChange(e) {
    const file = e.target.files[0]
    if (file) handleFileLoad(file)
    e.target.value = ''
  }

  return (
    <div className="input-pane">
      <div className="pane-header">
        <span className="pane-label">{label}</span>
        <div className="tab-group">
          <button
            className={`tab-btn${tab === 'paste' ? ' active' : ''}`}
            onClick={() => setTab('paste')}
          >
            Paste
          </button>
          <button
            className={`tab-btn${tab === 'upload' ? ' active' : ''}`}
            onClick={() => setTab('upload')}
          >
            Upload
          </button>
        </div>
      </div>

      {tab === 'paste' ? (
        <textarea
          className="code-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
        />
      ) : (
        <div
          className={`drop-zone${dragging ? ' dragging' : ''}${fileName ? ' has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !fileName && inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
          {fileName ? (
            <div className="file-loaded">
              <div className="file-info">
                <svg className="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="file-name">{fileName}</span>
              </div>
              <div className="file-actions">
                <button
                  className="file-btn"
                  onClick={(e) => { e.stopPropagation(); inputRef.current.click() }}
                >
                  Change
                </button>
                <button
                  className="file-btn file-btn-remove"
                  onClick={(e) => { e.stopPropagation(); handleRemove() }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="drop-prompt">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
              <p className="drop-text">Drop a file here or <span className="drop-link">browse</span></p>
              <p className="drop-hint">Any plain-text file, including .ipynb</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
