const { withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

const withFixedBouncyCastle = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('bouncycastle-pin')) {
      return config;
    }
    const fix = `
// START bouncycastle-pin
// Pin org.bouncycastle to a fixed version (Maven Central) so Gradle never
// needs to query jitpack.io's maven-metadata.xml for the dynamic [1.81,1.82)
// range (jitpack is frequently unreachable from EAS build servers).
configurations.all {
    resolutionStrategy.eachDependency { details ->
        if (details.requested.group == 'org.bouncycastle') {
            details.useVersion '1.81'
        }
    }
}
// END bouncycastle-pin
`;
    if (config.modResults.contents.includes('dependencies {')) {
      config.modResults.contents = config.modResults.contents.replace(
        'dependencies {',
        fix + '\n    dependencies {'
      );
    } else {
      config.modResults.contents = config.modResults.contents + '\n' + fix;
    }
    return config;
  });
};

module.exports = createRunOncePlugin(
  withFixedBouncyCastle,
  'withFixedBouncyCastle',
  '1.0.0'
);
