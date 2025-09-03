module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['e2e/step_definitions/*.ts', 'e2e/hooks/*.ts'],
    format: ['progress-bar'],
    paths: ['e2e/features/*.feature']
  }
}
