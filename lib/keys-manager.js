(() => {
  'use strict';

  const os = require('os');
  const path = require('path');
  const KeysRouter = require('./keys-router');

  class KeysManager {
    constructor() {
      this._router = new KeysRouter(this);
      this._baseServer = null;
    }

    load(messageCenter, baseServer) {
      return Promise.resolve()
      .then(() => this._router.load(baseServer))
      .then(() => this._messageCenter = messageCenter);
    }

    createKey(path) {
      return this._messageCenter.sendRequest('base#Keys create', null, path);
    }
  }

  module.exports = KeysManager;

})();
