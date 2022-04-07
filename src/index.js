/*
 *  Copyright 2018 - 2019 Mitsuha Kitsune <https://mitsuhakitsune.com>
 *  Licensed under the MIT license.
 */

import BackgroundScript from './backgroundScript';
import Browser from './browser';
import ContentScript from './contentScript';
import Logger from './logger';

var defaultOptions = {
  connectionName: 'vuex-webextensions',
  loggerLevel: 'warning',
  persistentStates: [],
  ignoredMutations: [],
  ignoredActions: [],
  syncActions: true
};

export default function(opt) {
  // Merge default options with passed settings
  const options = {
    ...defaultOptions,
    ...opt
  };

  // Set level of logs
  Logger.setLoggerLevel(options.loggerLevel);

  // Initialize browser class
  const browser = new Browser();

  return function(str) {
    // Inject the custom mutation to replace the state on load
    str.registerModule('@@VWE_Helper', {
      mutations: {
        vweReplaceState(state, payload) {
          Object.keys(str.state).forEach(function(key) {
            str.state[key] = payload[key];
          });
        }
      }
    });

    let ww = 'undefined';

    if (typeof window !== 'undefined') {
      ww = window;
    }

    // Get type of script and initialize connection
    browser.isBackgroundScript(ww).then(function(isBackground) {
      if (isBackground) {
        return new BackgroundScript(str, browser, options);
      }

      return new ContentScript(str, browser, options);
    });
  };
}
