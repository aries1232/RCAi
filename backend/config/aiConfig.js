// as there was very less time I thought it would be better to go with the alternative option like for the time being we can use the
//  online api and whennever we are ready and set our offline model the app with switch it
 export const aiConfig = {
  useOffline: false, // Set to true to use offline model
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: 'https://api.mistral.ai/v1',
    model: 'mistral-medium'
  },
  offline: {
    enabled: false, // Set to true if you have an offline model running
    endpoint: 'http://localhost:11434',
    model: 'mistral-7b'
  }
};

// Returns config for the selected AI mode
export const getAIConfig = () => {
  return aiConfig.useOffline ? aiConfig.offline : aiConfig.mistral;
};