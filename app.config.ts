import type { ConfigContext, ExpoConfig } from 'expo/config';
import { withEntitlementsPlist, withInfoPlist } from 'expo/config-plugins';

const appJson = require('./app.json');

export default ({ config: incomingConfig }: ConfigContext): ExpoConfig => {
  let config: ExpoConfig = {
    ...incomingConfig,
    ...appJson.expo,
    plugins: ['expo-font', 'expo-iap'],
  };

  config = withEntitlementsPlist(config, (entitlementsConfig) => {
    delete entitlementsConfig.modResults['aps-environment'];
    return entitlementsConfig;
  });

  config = withInfoPlist(config, (infoPlistConfig) => {
    if (Array.isArray(infoPlistConfig.modResults.UIBackgroundModes)) {
      infoPlistConfig.modResults.UIBackgroundModes =
        infoPlistConfig.modResults.UIBackgroundModes.filter(
          (mode) => mode !== 'remote-notification'
        );
      if (infoPlistConfig.modResults.UIBackgroundModes.length === 0) {
        delete infoPlistConfig.modResults.UIBackgroundModes;
      }
    }
    return infoPlistConfig;
  });

  return config;
};
