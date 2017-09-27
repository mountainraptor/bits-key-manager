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
      this._messenger = new global.helper.Messenger();
      this._messenger.addRequestListener('keys-manager#keys isPrivate', {scopes: ['base']}, isPrivate);
    }

    load(messageCenter, baseServer) {
      return Promise.resolve()
      .then(() => this._router.load(baseServer))
      .then(() => this._messageCenter = messageCenter)
      .then(() => this._messenger.load(messageCenter));
    }

    unload() {
      return Promise.resolve()
      .then(() => this._messenger.unload());
    }

    createKey(path) {
      return this._messageCenter.sendRequest('base#Keys create', null, {filepath: path});
    }
  }

  module.exports = KeysManager;

})();
