(() => {
  'use strict';

  const os = require('os');
  const path = require('path');
  const KeysRouter = require('./keys-router');
  const UtilCrypto = global.utils.UtilCrypto;

  function isPrivate(metadata, key) {
    return UtilCrypto.isFilePrivateKey(key._filepath)
    .then((bool) => {
      return bool;
    });
  }

  class KeysManager {
    constructor() {
      this._router = new KeysRouter(this);
      this._baseServer = null;
    }

    load(messageCenter, baseServer) {
      return Promise.resolve()
      .then(() => this._router.load(baseServer))
      .then(() => this._messageCenter = messageCenter)
      .then(() => this._messageCenter.addRequestListener('keys-manager#keys isPrivate', {scopes: ['base']}, isPrivate));
    }

    createKey(path) {
      return this._messageCenter.sendRequest('base#Keys create', null, {filepath: path});
    }
  }

  module.exports = KeysManager;

})();
