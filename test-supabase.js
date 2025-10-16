// Test Supabase Connection
// Run this with: node test-supabase.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Testing Supabase Connection...\n');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📍 Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check input-images bucket
    console.log('\n📦 Testing input-images bucket...');
    const { data: inputBucket, error: inputError } = await supabase.storage
      .from('input-images')
      .list('', { limit: 1 });

    if (inputError) {
      console.error('❌ input-images bucket error:', inputError.message);
      console.log('   👉 Create bucket: input-images (make it PUBLIC)');
    } else {
      console.log('✅ input-images bucket exists and is accessible');
    }

    // Test 2: Check output-images bucket
    console.log('\n📦 Testing output-images bucket...');
    const { data: outputBucket, error: outputError } = await supabase.storage
      .from('output-images')
      .list('', { limit: 1 });

    if (outputError) {
      console.error('❌ output-images bucket error:', outputError.message);
      console.log('   👉 Create bucket: output-images (make it PUBLIC)');
    } else {
      console.log('✅ output-images bucket exists and is accessible');
    }

    // Test 3: Check projects table
    console.log('\n📊 Testing projects table...');
    const { data: tableData, error: tableError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ projects table error:', tableError.message);
      console.log('   👉 Run the SQL from supabase-setup.sql');
    } else {
      console.log('✅ projects table exists and is accessible');
      console.log(`   Found ${tableData.length} records`);
    }

    console.log('\n✨ Supabase setup test complete!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testConnection();
