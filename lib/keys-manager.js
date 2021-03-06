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
  const KEY_FUNCTIONS_CMD = path.resolve(SCRIPTS_DIR, './key-functions');
  var KEY_MANAGER;

  function _list(metadata) {
    return KEY_MANAGER.list();
  }

  function _create(metadata, key) {
    return KEY_MANAGER.addKeyFromFilepath(key.filepath);
  }

  function _delete(metadata, key) {
    return new Promise((resolve, reject) => {
      KEY_MANAGER.getDevicePrivateKey()
      .then((devicePrivateKey) => {
        if (devicePrivateKey._hash === key.hash) {
          return reject('Device Key Required');
        } else {
          KEY_MANAGER.delete(key)
          .then((val) => {
            return resolve(val)
          });
        }
      })
    });
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

  function getKeyFingerprint(keyPath) {
    const args = [
      '-k', keyPath,
      '-f'
    ];

    const options = {
      cwd: SCRIPTS_DIR
    };

    return ChildProcess.createSpawnPromise(KEY_FUNCTIONS_CMD, args, options)
    .then((result) => {
      if (0 === result.code) {
        return Promise.resolve(result.stdout[0].replace(/(\r\n|\n|\r)/gm,""));
      } else if (1 === result.code) {
        return Promise.reject(new Error(result.stderr));
      } else {
        return Promise.reject(new Error(result.stderr));
      }
    });
  }

  function isKeyPrivate(keyPath) {
    const args = [
      '-k', keyPath,
      '-p'
    ];

    const options = {
      cwd: SCRIPTS_DIR
    };

    return ChildProcess.createSpawnPromise(KEY_FUNCTIONS_CMD, args, options)
    .then((result) => {
      if (0 === result.code) {
        return Promise.resolve(result.stdout[0].replace(/(\r\n|\n|\r)/gm,""));
      } else if (1 === result.code) {
        return Promise.reject(new Error(result.stderr));
      } else {
        return Promise.reject(new Error(result.stderr));
      }
    });
  }

  function fingerprint(metadata, key) {
    return Promise.resolve(getKeyFingerprint(key._filepath))
    .then((fingerprint) => {
      key._fingerprint = fingerprint;
      return Promise.resolve(key);
    });
  }

  function markPrivate(metadata, key) {
    return Promise.resolve(isKeyPrivate(key._filepath))
    .then((bool) => {
      if(bool === 'true') {
        key._private = bool;
      }
      return Promise.resolve(key);
    });
  }

  class KeysManager {
    constructor(keyManager) {
      this._router = new KeysRouter(this);
      this._keyManager = keyManager;
      KEY_MANAGER = keyManager;
      this._messenger = new global.helper.Messenger();
      this._messenger.addRequestListener('keys-manager#keys list', {scopes: ['base']}, _list);
      this._messenger.addRequestListener('keys-manager#keys create', {scopes: ['base']}, _create);
      this._messenger.addRequestListener('keys-manager#keys delete', {scopes: ['base']}, _delete);
      this._messenger.addRequestListener('keys-manager#keys generate', {scopes: ['base']}, generateKey);
      this._messenger.addRequestListener('keys-manager#keys fingerprint', {scopes: ['base']}, fingerprint);
      this._messenger.addRequestListener('keys-manager#keys markPrivate', {scopes: ['base']}, markPrivate);
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
      .then(() => this._keyManager.unload())
      .then(() => this._messenger.unload())
      .then(() => this._messageCenter.unload())
      .then(() => this._router.unload());
    }

    createKey(path) {
      return this._messageCenter.sendRequest('keys-manager#keys create', null, {filepath: path});
    }
  }

  module.exports = KeysManager;

})();
