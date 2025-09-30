const ZetkoAdapter = require('./zetko-adapter');

class GateProviderFactory {
  static createProvider(gymConfig) {
    if (gymConfig.gate_provider === 'zetko') {
      return new ZetkoAdapter(gymConfig);
    }
    
    throw new Error(`Unsupported gate provider: ${gymConfig.gate_provider}`);
  }
}

module.exports = GateProviderFactory;