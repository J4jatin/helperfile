"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pure = require("./pure");

Object.keys(_pure).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _pure[key];
    }
  });
});

// if we're running in a test runner that supports afterEach
// or teardown then we'll automatically run cleanup afterEach test
// this ensures that tests run in isolation from each other
// if you don't like this then either import the `pure` module
// or set the RTL_SKIP_AUTO_CLEANUP env variable to 'true'.
if (!process.env.RTL_SKIP_AUTO_CLEANUP) {
  // ignore teardown() in code coverage because Jest does not support it

  /* istanbul ignore else */
  if (typeof afterEach === 'function') {
    afterEach(() => {
      (0, _pure.cleanup)();
    });
  } else if (typeof teardown === 'function') {
    // Block is guarded by `typeof` check.
    // eslint does not support `typeof` guards.
    // eslint-disable-next-line no-undef
    teardown(() => {
      (0, _pure.cleanup)();
    });
  }
}