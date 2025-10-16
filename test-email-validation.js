require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Configuration...\n');
console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('\n📧 Testing different email domains...\n');

  const testCases = [
    { email: 'test@example.com', shouldWork: false, note: 'Blocked by Supabase' },
    { email: 'test@gmail.com', shouldWork: true, note: 'Real domain' },
    { email: `test-${Date.now()}@gmail.com`, shouldWork: true, note: 'Unique real domain' },
  ];

  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.email}`);
    console.log(`Expected: ${testCase.shouldWork ? '✅ Should work' : '❌ Should fail'}`);
    console.log(`Note: ${testCase.note}`);

    const { data, error } = await supabase.auth.signUp({
      email: testCase.email.trim().toLowerCase(),
      password: 'TestPassword123!',
    });

    if (error) {
      console.log(`Result: ❌ ${error.message}`);
      if (!testCase.shouldWork) {
        console.log('✓ Failed as expected\n');
      } else {
        console.log('✗ Unexpected failure\n');
      }
    } else {
      console.log(`Result: ✅ Success`);
      console.log(`User ID: ${data.user?.id}`);
      console.log(`Has session: ${data.session ? 'Yes' : 'No (email confirmation required)'}`);
      
      if (testCase.shouldWork) {
        console.log('✓ Worked as expected\n');
        
        // Clean up: delete the test user
        if (data.user) {
          console.log('Cleaning up test user...');
          // Note: Can't delete with anon key, would need admin API
        }
      } else {
        console.log('✗ Should have failed\n');
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  console.log('\n❌ AVOID these email domains:');
  console.log('   - example.com');
  console.log('   - test.com');
  console.log('   - localhost');
  console.log('   - .local domains');
  console.log('\n✅ USE these email domains:');
  console.log('   - gmail.com');
  console.log('   - outlook.com');
  console.log('   - yahoo.com');
  console.log('   - hotmail.com');
  console.log('   - Your own real domain');
  console.log('\n💡 TIP: For testing, create a Gmail account like:');
  console.log('   yourname+test1@gmail.com');
  console.log('   yourname+test2@gmail.com');
  console.log('   (Gmail ignores everything after +)');
  console.log('\n');
}

async function checkAuthSettings() {
  console.log('\n' + '='.repeat(60));
  console.log('⚙️  CHECKING SUPABASE SETTINGS');
  console.log('='.repeat(60) + '\n');

  console.log('To fix this issue, check your Supabase Dashboard:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT');
  console.log('2. Navigate to: Authentication → Providers → Email');
  console.log('3. Verify these settings:');
  console.log('   ✅ Enable Email Provider: ON');
  console.log('   ⚠️  Confirm Email: OFF (for development)');
  console.log('   ✅ Secure Email Change: ON');
  console.log('\n4. Navigate to: Authentication → URL Configuration');
  console.log('5. Add these URLs:');
  console.log('   Site URL: http://localhost:3000');
  console.log('   Redirect URLs:');
  console.log('     - http://localhost:3000/**');
  console.log('\n6. Save and wait 1-2 minutes for changes to propagate\n');
}

async function run() {
  try {
    await checkAuthSettings();
    await testAuth();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

run();
