/**

**/

(() => {
  'use strict';

  const path = require('path');
  const KeysManager = require('./lib/keys-manager');
  const BaseServer = global.helper.BaseServer;
  const KeyManager = require(path.resolve(global.paths.data, '../lib/key/key-manager'));

  class KeysManagerApp {
    constructor() {
      this._baseServer = new BaseServer({logging: true});
      this._keyManager = new KeyManager();
      this._keysManager = new KeysManager(this._keyManager);
    }

    load(messageCenter) {
      return Promise.resolve()
      .then(() => this._baseServer.load(messageCenter))
      .then(() => this._keyManager.load(messageCenter))
      .then(() => this._keysManager.load(messageCenter, this._baseServer, this._keyManager));
    }

    unload(messageCenter) {
      return Promise.resolve()
      .then(() => this._keysManager.unload(messageCenter))
      .then(() => this._baseServer.unload());
    }
  }

  module.exports = new KeysManagerApp();
})();
