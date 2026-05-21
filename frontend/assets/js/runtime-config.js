/**
 * Loads first — sets production API before any other script.
 * Prevents cached/old bundles from defaulting to localhost on Vercel.
 */
(function () {
  var PRODUCTION_API = 'https://dole-embolism-trustless.ngrok-free.dev/api';
  var host = window.location.hostname;
  var isLocalDev = host === 'localhost' || host === '127.0.0.1';

  if (!isLocalDev) {
    window.__SGT_API_BASE__ = PRODUCTION_API;
    window.__SGT_FORCE_PRODUCTION__ = true;
  }
})();
