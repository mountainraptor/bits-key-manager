(() => {
  'use strict';

  const os = require('os');
  const path = require('path');
  const KeysRouter = require('./keys-router');
  const UtilCrypto = global.utils.UtilCrypto;
  const ChildProcess = global.helper.ChildProcess;
  const SCRIPTS_DIR = path.join(__dirname, '../scripts');
  const KEYS_DIR = path.resolve(global.paths.data, 'base/keys');
  const GENERATE_KEYS_CMD = path.resolve(SCRIPTS_DIR, './generate-rsa-keys');

  function isPrivate(metadata, key) {
    return UtilCrypto.isFilePrivateKey(key._filepath)
    .then((bool) => {
      return bool;
    });
  }

  function generateKey(metadata) {
    const args = [
      '-d', KEYS_DIR // The directory to save the new keypair
    ];

    const options = {
      cwd: SCRIPTS_DIR
    };

    return ChildProcess.createSpawnPromise(GENERATE_KEYS_CMD, args, options)
    .then((result) => {
      if (0 === result.code) {
        return "test" //TODO: return a useful value
      } else if (1 === result.code) {
        return Promise.reject(new Error(result.stderr));
      } else {
        return Promise.reject(new Error('cool error'));
      }
    });
  }

  class KeysManager {
    constructor() {
      this._router = new KeysRouter(this);
      this._baseServer = null;
      this._messenger = new global.helper.Messenger();
      this._messenger.addRequestListener('keys-manager#keys isPrivate', {scopes: ['base']}, isPrivate);
      this._messenger.addRequestListener('keys-manager#keys generate', {scopes: ['base']}, generateKey);
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
