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
  var KEY_MANAGER;

  function _list(metadata) {
    return KEY_MANAGER.list();
  }

  function _create(metadata, key) {
    return KEY_MANAGER.addKeyFromFilepath(key.filepath);
  }

  function _delete(metadata, key) {
    return KEY_MANAGER.delete(key);
  }

  function generateKey(metadata, basename) {
    const args = [
      '-b', basename.basename,
      '-d', KEYS_DIR
    ];

    const options = {
      cwd: SCRIPTS_DIR
    };

    return ChildProcess.createSpawnPromise(GENERATE_KEYS_CMD, args, options)
    .then((result) => {
      if (0 === result.code) {
        return result.stdout
      } else if (1 === result.code) {
        return Promise.reject(new Error(result.stderr));
      } else {
        return Promise.reject(new Error(result.stderr));
      }
    });
  }

  function isPrivate(metadata, key) {
    return UtilCrypto.isFilePrivateKey(key._filepath)
    .then((bool) => {
      return bool;
    });
  }

  class KeysManager {
    constructor(keyManager) {
      this._router = new KeysRouter(this);
      this._keyManager = keyManager;
      KEY_MANAGER = this._keyManager;
      this._messenger = new global.helper.Messenger();
      this._messenger.addRequestListener('keys-manager#keys list', {scopes: ['base']}, _list);
      this._messenger.addRequestListener('keys-manager#keys create', {scopes: ['base']}, _create);
      this._messenger.addRequestListener('keys-manager#keys delete', {scopes: ['base']}, _delete);
      this._messenger.addRequestListener('keys-manager#keys generate', {scopes: ['base']}, generateKey);
      this._messenger.addRequestListener('keys-manager#keys isPrivate', {scopes: ['base']}, isPrivate);
    }

    load(messageCenter, baseServer) {
      return Promise.resolve()
      .then(() => this._router.load(baseServer))
      .then(() => this._messageCenter = messageCenter)
      .then(() => this._messenger.load(messageCenter))
      .then(() => this._keyManager.load(messageCenter));
    }

    unload() {
      return Promise.resolve()
      .then(() => this._messenger.unload());
    }

    createKey(path) {
      return this._messageCenter.sendRequest('keys-manager#keys create', null, {filepath: path});
    }
  }

  module.exports = KeysManager;

})();
