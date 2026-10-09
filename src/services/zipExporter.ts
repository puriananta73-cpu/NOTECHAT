import JSZip from 'jszip';

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Project configuration files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'notechat-app',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          'lucide-react': '^0.546.0',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          'canvas-confetti': '^1.9.4',
          jszip: '^3.10.1',
          motion: '^12.23.24',
        },
        devDependencies: {
          '@tailwindcss/vite': '^4.3.3',
          '@types/canvas-confetti': '^1.9.0',
          '@types/node': '^22.14.0',
          '@types/react': '^19.3.0',
          '@types/react-dom': '^19.3.0',
          '@vitejs/plugin-react': '^6.1.1',
          tailwindcss: '^4.3.3',
          typescript: '^7.0.2',
          vite: '^8.3.0',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Ensures relative assets work on Netlify and GitHub Pages
});
`
  );

  zip.file(
    'netlify.toml',
    `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          experimentalDecorators: true,
          useDefineForClassFields: false,
          module: 'ESNext',
          types: ['vite/client'],
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          isolatedModules: true,
          moduleDetection: 'force',
          allowJs: true,
          jsx: 'react-jsx',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'index.html',
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>QuickNote - Clean & Fast Personal Notes</title>
    <meta name="description" content="A clean, minimal, and lightning-fast private notebook to capture your thoughts, daily plans, and checklists." />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z'/><path d='M15 3v6h6'/><path d='M9 13h6'/><path d='M9 17h4'/></svg>" />
  </head>
  <body class="bg-[#fafaf9] text-stone-800 antialiased selection:bg-amber-100 selection:text-amber-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  );

  zip.file(
    'README.md',
    `# NoteChat (QuickNote Disguise)

A desktop-first web application that disguises a secret group chat as an innocent personal notes app ("QuickNote").

## 🤫 Secret Trigger
- **Trigger**: In the notes interface, create a new note and set the title to \`#APAP\` (case-sensitive).
- **Shortcut**: Or press \`Ctrl + Shift + A\` (or \`Cmd + Shift + A\` on macOS).
- **Panic Button**: Hit \`Esc\` or click the discrete exit icon anytime to instantly snap back to the QuickNote view.

## 🚀 Deploy to Netlify
1. Unzip this package.
2. Drag and drop the folder into [Netlify Drop](https://app.netlify.com/drop) OR:
3. Connect your GitHub repository to Netlify:
   - **Build command**: \`npm run build\`
   - **Publish directory**: \`dist\`

## 📦 Local Development
\`\`\`bash
npm install
npm run dev
\`\`\`

## ⚡ GitHub Pages Deployment
Run \`npm run build\` and publish the \`dist/\` directory to \`gh-pages\` branch.
`
  );

  // Generate binary zip
  return await zip.generateAsync({ type: 'blob' });
}
