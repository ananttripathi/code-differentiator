function parseNotebook(text) {
  let nb
  try {
    nb = JSON.parse(text)
  } catch {
    return text
  }

  const cells = nb.cells || []
  return cells
    .map((cell, i) => {
      const source = Array.isArray(cell.source)
        ? cell.source.join('')
        : typeof cell.source === 'string'
        ? cell.source
        : ''
      const header = `# ── Cell ${i + 1} [${cell.cell_type}] ──`
      return header + '\n' + source
    })
    .join('\n\n')
}

export async function parseFile(file) {
  const text = await file.text()
  if (file.name.endsWith('.ipynb')) {
    return parseNotebook(text)
  }
  return text
}
