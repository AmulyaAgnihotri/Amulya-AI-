/**
 * Export chat messages as Markdown file.
 */
export function exportAsMarkdown(messages, title = 'Amulya AI Chat') {
  let md = `# ${title}\n\n`;
  md += `*Exported from Amulya AI on ${new Date().toLocaleString()}*\n\n---\n\n`;

  messages.forEach(msg => {
    if (msg.role === 'user') {
      md += `## 🧑 You\n\n${msg.content}\n\n`;
    } else if (msg.role === 'assistant') {
      md += `## 🤖 Amulya AI\n\n${msg.content}\n\n`;
    }
    md += `---\n\n`;
  });

  downloadFile(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`, md, 'text/markdown');
}

/**
 * Export chat messages as a simple PDF (HTML-based).
 */
export function exportAsPDF(messages, title = 'Amulya AI Chat') {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #fff; color: #111; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 12px; margin-bottom: 30px; }
        .message { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #eee; }
        .role { font-weight: 700; font-size: 13px; color: #333; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .role.user { color: #2563eb; }
        .role.ai { color: #059669; }
        .content { font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
        pre { background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; }
        code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">Exported from Amulya AI — ${new Date().toLocaleString()}</div>
      ${messages.map(msg => `
        <div class="message">
          <div class="role ${msg.role === 'user' ? 'user' : 'ai'}">
            ${msg.role === 'user' ? '🧑 You' : '🤖 Amulya AI'}
          </div>
          <div class="content">${escapeHtml(msg.content)}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  // Open in new window and trigger print (browser PDF)
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
