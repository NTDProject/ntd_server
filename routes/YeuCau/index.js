const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');
const { check, validationResult, body } = require('express-validator');
const bcryptjs = require('bcryptjs');
const privateRouteChienDich = require('./yeuCau');
/* Add User */


privateRouteChienDich(router);

module.exports = router;
