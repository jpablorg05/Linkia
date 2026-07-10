const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace dark text colors with var(--text-main)
  content = content.replace(/['"]#(0f172a|1e293b|334155|000000|000|111|111111|333|333333)['"]/gi, "'var(--text-main)'");
  
  // Replace muted text colors with var(--text-muted)
  content = content.replace(/['"]#(475569|64748b|94a3b8|555|555555)['"]/gi, "'var(--text-muted)'");
  
  // Replace light backgrounds with var(--bg-main)
  content = content.replace(/['"]#(f8fafc|f9f9f9|f1f5f9|f0f2f2|f9fafb|f0f9ff)['"]/gi, "'var(--bg-main)'");
  
  // Replace white backgrounds with var(--bg-panel)
  content = content.replace(/background:\s*['"]#ffffff['"]/gi, "background: 'var(--bg-panel)'");
  content = content.replace(/background:\s*['"]#fff['"]/gi, "background: 'var(--bg-panel)'");
  content = content.replace(/backgroundColor:\s*['"]#ffffff['"]/gi, "backgroundColor: 'var(--bg-panel)'");
  content = content.replace(/backgroundColor:\s*['"]#fff['"]/gi, "backgroundColor: 'var(--bg-panel)'");
  
  // Replace light borders with var(--border-color)
  content = content.replace(/['"]#(e2e8f0|cbd5e1|e5e7eb|f3f4f6)['"]/gi, "'var(--border-color)'");

  // Fix border lines
  content = content.replace(/1px solid #(e2e8f0|cbd5e1|e5e7eb|f3f4f6)/gi, "1px solid var(--border-color)");
  content = content.replace(/2px solid #(e2e8f0|cbd5e1|e5e7eb|f3f4f6)/gi, "2px solid var(--border-color)");
  content = content.replace(/1px dashed #(e2e8f0|cbd5e1|e5e7eb|f3f4f6)/gi, "1px dashed var(--border-color)");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Done replacing colors.');
