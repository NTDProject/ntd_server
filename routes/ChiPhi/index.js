const express = require('express');
const router = express.Router();
const dbs = require('../../utils/dbs');
const { check, validationResult, body } = require('express-validator');
const bcrypt = require('bcrypt');
const privateRouteChiPhi = require('./chiphi');
/* Add User */


privateRouteChiPhi(router);

module.exports = router;
