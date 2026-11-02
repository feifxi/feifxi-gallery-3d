/**
 * Paths in data.js start with '/', meaning "a file in public/". On GitHub Pages the site may live
 * under a sub-folder (username.github.io/<repo>/), so resolve them against wherever the page is hosted.
 * Full URLs (https://…) are left alone.
 */
export const asset = (path) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? import.meta.env.BASE_URL + path.slice(1) : path
