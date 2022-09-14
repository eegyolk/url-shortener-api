const express = require('express');

// Middleware
const AuthMiddleWare = require('../app/Http/Middleware/AuthMiddleware');
const IpMiddleware = require('../app/Http/Middleware/IpMiddleware');
const PublicResourceCredentialMiddleware = require('../app/Http/Middleware/PublicResourceCredentialMiddleware');
const RateLimitMiddleware = require('../app/Http/Middleware/RateLimitMiddleware');
const VerificationProcedureMiddleware = require('../app/Http/Middleware/VerificationProcedureMiddleware');

// Controllers
const ExampleController = require('../app/Http/Controllers/ExampleController');
const GameLaunchController = require('../app/Http/Controllers/GameLaunchController');
const GenerateAuthHeadersController = require('../app/Http/Controllers/GenerateAuthHeadersController');
const OperatorUsersController = require('../app/Http/Controllers/OperatorUsersController');
const BetHistoryController = require('../app/Http/Controllers/BetHistoryController');
const LogOutController = require('../app/Http/Controllers/LogOutController');
const PlaceBetController = require('../app/Http/Controllers/PlaceBetController');
const SettleBetController = require('../app/Http/Controllers/SettleBetController');
const UnsettleBetController = require('../app/Http/Controllers/UnsettleBetController');
const SportsController = require('../app/Http/Controllers/SportsController');
const LeaguesController = require('../app/Http/Controllers/LeaguesController');
const ReSettleBetController = require('../app/Http/Controllers/ReSettleBetController');
const ReUnsettleBetController = require('../app/Http/Controllers/ReUnsettleBetController');

router = express.Router();

router.get(
  '/example/:id',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  ExampleController.getExample
);
router.get(
  '/examples',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  ExampleController.getExamples
);
router.post(
  '/example',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  ExampleController.createExample
);
router.put(
  '/example/:id',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  ExampleController.updateExample
);
router.delete(
  '/example/:id',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  ExampleController.deleteExample
);
router.post(
  '/game-launch',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  GameLaunchController.gameLaunch
);
router.post(
  '/generate-auth-headers',
  [
    VerificationProcedureMiddleware.selfCheck,
    PublicResourceCredentialMiddleware.checkCredential,
  ],
  GenerateAuthHeadersController.generateAuthHeaders
);
router.post(
  '/create-user',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  OperatorUsersController.createUser
);
router.get(
  '/bet-history',
  [
    VerificationProcedureMiddleware.selfCheck,
    AuthMiddleWare.checkAuth,
    RateLimitMiddleware.betHistory,
  ],
  BetHistoryController.getHistory
);
router.post(
  '/log-out',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  LogOutController.logOut
);
router.post(
  '/place-bet',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  PlaceBetController.placeBet
);
router.post(
  '/settle-bet',
  [
    VerificationProcedureMiddleware.selfCheck,
    VerificationProcedureMiddleware.workerCheck,
    IpMiddleware.checkIp,
  ],
  SettleBetController.settleBet
);
router.post(
  '/unsettle-bet',
  [
    VerificationProcedureMiddleware.selfCheck,
    VerificationProcedureMiddleware.workerCheck,
    IpMiddleware.checkIp,
  ],
  UnsettleBetController.unsettleBet
);
router.get(
  '/get-sports',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  SportsController.getSports
);
router.get(
  '/get-leagues',
  [VerificationProcedureMiddleware.selfCheck, AuthMiddleWare.checkAuth],
  LeaguesController.getLeagues
);
router.post(
  '/re-settle-bet',
  [VerificationProcedureMiddleware.selfCheck, IpMiddleware.checkIp],
  ReSettleBetController.reSettle
);
router.post(
  '/re-unsettle-bet',
  [VerificationProcedureMiddleware.selfCheck, IpMiddleware.checkIp],
  ReUnsettleBetController.reUnsettle
);

module.exports = router;
