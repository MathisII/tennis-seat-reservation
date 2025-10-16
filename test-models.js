// Test which Replicate models work with your API key
const Replicate = require('replicate');
require('dotenv').config({ path: '.env.local' });

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function testModels() {
  console.log('\n🔍 Testing Replicate Models...\n');

  // Test a simple public model first
  try {
    console.log('Testing basic model access...');
    const models = [
      'stability-ai/stable-diffusion',
      'tencentarc/gfpgan',
      'nightmareai/real-esrgan',
      'xinntao/realesrgan',
    ];

    for (const modelName of models) {
      try {
        const model = await replicate.models.get(modelName.split('/')[0], modelName.split('/')[1]);
        console.log(`✅ ${modelName} - Available`);
        console.log(`   Latest version: ${model.latest_version?.id?.substring(0, 16)}...`);
      } catch (error) {
        console.log(`❌ ${modelName} - ${error.message}`);
      }
    }

    // Try to list your account's models
    console.log('\n📋 Checking your account permissions...');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testModels();
