/**

**/

(() => {
  'use strict';

  const KeysManager = require('./lib/keys-manager');
  const BaseServer = global.helper.BaseServer;

  class KeysManagerApp {
    constructor() {
      this._baseServer = new BaseServer({logging: true});
      this._keysManager = new KeysManager();
    }

    load(messageCenter) {
      return Promise.resolve()
      .then(() => this._baseServer.load(messageCenter))
      .then(() => this._keysManager.load(messageCenter, this._baseServer));
    }

    unload(messageCenter) {
      return Promise.resolve()
      .then(() => this._keysManager.unload(messageCenter))
      .then(() => this._baseServer.unload());
    }
  }

  module.exports = new KeysManagerApp();
})();
