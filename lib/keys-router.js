/**

**/
(() => {
  'use strict';

  const ROUTER_PATH = '/api/keys-router/keys';

  const path = require('path');
  const BaseServer = global.helper.BaseServer;
  const UtilFs = global.utils.UtilFs;
  const express = BaseServer.express;
  const passport = BaseServer.passport;
  const bodyParser = BaseServer.bodyParser;
  const multer = BaseServer.multer;
  const Router = express.Router;

  class KeysRouter {
    constructor(manager) {
      this._manager = manager;
      this._keysDir = path.resolve(global.paths.data, 'base/keys');

      const storage = multer.diskStorage({
        destination: function(req, file, cb) {
          cb(null, path.resolve(global.paths.data, 'base/keys'));
        },
        filename: function(req, file, cb) {
          cb(null, file.originalname);
        }
      });

      const upload = multer({storage: storage});

      this._router = new Router();
      this._router.post('/upload', upload.single('image'), (req, res) => {
        UtilFs.exists(path.resolve(req.file.destination, req.file.originalname))
        .then(() => this._manager.createKey(path.resolve(req.file.destination, req.file.originalname)))
        .then(() => res.status(200).json({success: true, error: null}))
        .catch((err) => {
          res.status(400).json({success: false, error: err.message});
          // If the file is not a key, don't keep it
          if(err.message == 'keys/invalid-key') {
            UtilFs.unlink(path.resolve(req.file.destination, req.file.originalname));
          }
        });
      });

      this._router.get('/:filepath/download', (req, res, next) => {
        Promise.resolve()
        .then(() => {
          return new Promise(function(resolve, reject) {
            res.download(req.params.filepath, path.basename(req.params.filepath), (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }).catch(next);
      });
    }

    load(baseServer) {
      return Promise.resolve()
      .then(() => {
        this._baseServer = baseServer;
        UtilFs.ensureDirectoryExists(this._keysDir);
      })
      .then(() => this._baseServer.use(ROUTER_PATH, this._router));
    }

    unload() {
      return Promise.resolve()
      .then(() => this._baseServer.removeMiddleware(ROUTER_PATH, this._router))
      .then(() => {
        this._baseServer = null;
      });
    }
  }

  module.exports = KeysRouter;
})();
