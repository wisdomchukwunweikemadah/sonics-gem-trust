/**
 * MUST load first in <head> — sets production API before any cached bundle.
 */
(function (w) {
  var PROD = 'https://dole-embolism-trustless.ngrok-free.dev/api';
  var LOCAL = 'http://localhost:5001/api';
  var host = w.location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';

  if (!isLocal) {
    w.SGT_API_URL = PROD;
    w.__SGT_API_BASE__ = PROD;
    w.__SGT_FORCE_PRODUCTION__ = true;
    try {
      w.localStorage.removeItem('sgt_api_base');
    } catch (e) {}
  } else {
    w.SGT_API_URL = w.SGT_API_URL || LOCAL;
  }
})(window);
