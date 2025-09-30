const express = require('express');
const router = express.Router();

// Country configurations
const COUNTRY_CONFIGS = {
  UAE: {
    currency: 'AED',
    vatRate: 0.05,
    idType: 'Emirates ID',
    transferFee: 150,
    freezePolicy: 'yearly_only',
    languages: ['en', 'ar'],
    paymentMethods: ['stripe_uae', 'cash', 'card'],
    legalRequirements: ['uae_waiver', 'emirates_id']
  },
  USA: {
    currency: 'USD',
    vatRate: 0.0875,
    idType: 'SSN',
    transferFee: 50,
    freezePolicy: 'monthly',
    languages: ['en'],
    paymentMethods: ['stripe_us', 'paypal', 'card'],
    legalRequirements: ['liability_waiver']
  },
  UK: {
    currency: 'GBP',
    vatRate: 0.20,
    idType: 'National Insurance',
    transferFee: 40,
    freezePolicy: 'monthly',
    languages: ['en'],
    paymentMethods: ['stripe_uk', 'card'],
    legalRequirements: ['uk_waiver', 'gdpr_consent']
  },
  CANADA: {
    currency: 'CAD',
    vatRate: 0.13,
    idType: 'SIN',
    transferFee: 60,
    freezePolicy: 'monthly',
    languages: ['en', 'fr'],
    paymentMethods: ['stripe_ca', 'card'],
    legalRequirements: ['liability_waiver']
  },
  AUSTRALIA: {
    currency: 'AUD',
    vatRate: 0.10,
    idType: 'TFN',
    transferFee: 70,
    freezePolicy: 'monthly',
    languages: ['en'],
    paymentMethods: ['stripe_au', 'card'],
    legalRequirements: ['liability_waiver']
  }
};

// Get country configuration
router.get('/config/:country', (req, res) => {
  const country = req.params.country.toUpperCase();
  const config = COUNTRY_CONFIGS[country];
  
  if (!config) {
    return res.status(404).json({ error: 'Country not supported' });
  }
  
  res.json({
    country,
    config,
    supportedCountries: Object.keys(COUNTRY_CONFIGS)
  });
});

// Get all supported countries
router.get('/supported', (req, res) => {
  res.json({
    countries: Object.keys(COUNTRY_CONFIGS).map(code => ({
      code,
      name: getCountryName(code),
      currency: COUNTRY_CONFIGS[code].currency,
      languages: COUNTRY_CONFIGS[code].languages
    }))
  });
});

// Membership transfer with country-specific fees
router.post('/transfer', (req, res) => {
  const { memberId, fromGym, toGym, country } = req.body;
  const config = COUNTRY_CONFIGS[country?.toUpperCase()] || COUNTRY_CONFIGS.UAE;
  
  const transferData = {
    memberId,
    fromGym,
    toGym,
    fee: config.transferFee,
    currency: config.currency,
    vatRate: config.vatRate,
    totalAmount: config.transferFee * (1 + config.vatRate),
    timestamp: new Date().toISOString(),
    country
  };
  
  res.json({
    success: true,
    transfer: transferData,
    message: `Transfer fee: ${config.currency} ${transferData.totalAmount.toFixed(2)}`
  });
});

// Membership freeze with country-specific policies
router.post('/freeze', (req, res) => {
  const { memberId, duration, country } = req.body;
  const config = COUNTRY_CONFIGS[country?.toUpperCase()] || COUNTRY_CONFIGS.UAE;
  
  if (config.freezePolicy === 'yearly_only' && duration !== '1_year') {
    return res.status(400).json({
      error: `${country} only allows yearly membership freeze`
    });
  }
  
  res.json({
    success: true,
    freeze: {
      memberId,
      duration,
      policy: config.freezePolicy,
      country,
      timestamp: new Date().toISOString()
    }
  });
});

function getCountryName(code) {
  const names = {
    UAE: 'United Arab Emirates',
    USA: 'United States',
    UK: 'United Kingdom',
    CANADA: 'Canada',
    AUSTRALIA: 'Australia'
  };
  return names[code] || code;
}

module.exports = router;