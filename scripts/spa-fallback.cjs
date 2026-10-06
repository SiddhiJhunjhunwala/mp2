// GitHub Pages has no SPA routing. Copying index.html to 404.html makes
// deep links like /mp2/pokemon/25 load the app instead of a GitHub 404.
const fs = require('fs');
fs.copyFileSync('dist/index.html', 'dist/404.html');
console.log('Copied dist/index.html -> dist/404.html');
