/**
 * Test script to verify ELI API access
 * Run this on Mikrus FROG to check if API works
 */

const ELI_API_BASE = 'https://api.sejm.gov.pl/eli';

console.log('🧪 Testing ELI API access from this server...\n');

// Test 1: List publishers
console.log('Test 1: GET /acts (list publishers)');
try {
  const response = await fetch(`${ELI_API_BASE}/acts`, {
    headers: { 'Accept': 'application/json' },
  });
  console.log(`  Status: ${response.status} ${response.statusText}`);
  if (response.ok) {
    const data = await response.json();
    console.log(`  ✅ SUCCESS - Found ${data.length} publishers`);
  } else {
    const text = await response.text();
    console.log(`  ❌ FAILED - Response: ${text}`);
  }
} catch (error) {
  console.log(`  ❌ ERROR - ${error.message}`);
}

console.log('');

// Test 2: Search for acts
console.log('Test 2: GET /acts/search?title=konstytucja&limit=3');
try {
  const response = await fetch(
    `${ELI_API_BASE}/acts/search?title=konstytucja&limit=3`,
    {
      headers: { 'Accept': 'application/json' },
    },
  );
  console.log(`  Status: ${response.status} ${response.statusText}`);
  if (response.ok) {
    const data = await response.json();
    console.log(`  ✅ SUCCESS - Found ${data.count} acts`);
    if (data.items && data.items.length > 0) {
      console.log(`  First result: ${data.items[0].title}`);
    }
  } else {
    const text = await response.text();
    console.log(`  ❌ FAILED - Response: ${text}`);
  }
} catch (error) {
  console.log(`  ❌ ERROR - ${error.message}`);
}

console.log('');

// Test 3: Get specific act (Kodeks cywilny)
console.log('Test 3: GET /acts/DU/1964/16 (Kodeks cywilny)');
try {
  const response = await fetch(`${ELI_API_BASE}/acts/DU/1964/16`, {
    headers: { 'Accept': 'application/json' },
  });
  console.log(`  Status: ${response.status} ${response.statusText}`);
  if (response.ok) {
    const data = await response.json();
    console.log(`  ✅ SUCCESS - ${data.title}`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Has HTML: ${data.textHTML ? 'Yes' : 'No'}`);
  } else {
    const text = await response.text();
    console.log(`  ❌ FAILED - Response: ${text}`);
  }
} catch (error) {
  console.log(`  ❌ ERROR - ${error.message}`);
}

console.log('');

// Test 4: Get HTML text
console.log('Test 4: GET /acts/DU/1964/16/text.html (Kodeks cywilny - HTML)');
try {
  const response = await fetch(`${ELI_API_BASE}/acts/DU/1964/16/text.html`, {
    headers: { 'Accept': 'text/html' },
  });
  console.log(`  Status: ${response.status} ${response.statusText}`);
  if (response.ok) {
    const html = await response.text();
    console.log(`  ✅ SUCCESS - Received ${html.length} characters of HTML`);
    // Check if we can find article 533
    const hasArt533 = html.includes('533') || html.includes('Art. 533');
    console.log(`  Contains Art. 533: ${hasArt533 ? 'Yes' : 'No'}`);
  } else {
    const text = await response.text();
    console.log(`  ❌ FAILED - Response: ${text}`);
  }
} catch (error) {
  console.log(`  ❌ ERROR - ${error.message}`);
}

console.log('');
console.log('─────────────────────────────────────────');
console.log('');
console.log('📊 SUMMARY:');
console.log('If all tests show ✅ SUCCESS - API is accessible from this server!');
console.log('If tests show ❌ FAILED with "Access denied" - server IP is blocked');
console.log('');
console.log('Next steps:');
console.log('1. If SUCCESS → Deploy full MCP server');
console.log('2. If FAILED → Try different VPS provider or contact api.sejm.gov.pl');
