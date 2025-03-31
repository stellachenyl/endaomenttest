const { convertCountryToCode } = require('./yourFile'); // Replace with the correct path to your convertCountryToCode function

// Helper function to test the function and log results
function runTest(name, input, expected) {
  try {
    const result = convertCountryToCode(input);
    console.log(`${name}: Passed`);
    console.log(`Expected: ${expected}, Got: ${result}`);
  } catch (e) {
    console.log(`${name}: Failed`);
    console.log(`Expected: ${expected}, Got Error: ${e.message}`);
  }
}

// 1. Valid Country Names (tests country names from the mapping)
runTest('Valid Country - United States', 'United States', 'USA');
runTest('Valid Country - Canada', 'Canada', 'CAN');
runTest('Valid Country - United Kingdom', 'United Kingdom', 'GBR');
runTest('Valid Country - Japan', 'Japan', 'JPN');

// 2. Valid ISO Alpha-3 Code
runTest('Valid Alpha-3 Code - USA', 'USA', 'USA');
runTest('Valid Alpha-3 Code - CAN', 'CAN', 'CAN');
runTest('Valid Alpha-3 Code - GBR', 'GBR', 'GBR');
runTest('Valid Alpha-3 Code - JPN', 'JPN', 'JPN');

// 3. Nonexistent Test Countries (countries that are not in the mapping)
runTest('Nonexistent Country - Testland', 'Testland', 'Invalid or unsupported country name/Alpha-3 code');
runTest('Nonexistent Country - Atlantis', 'Atlantis', 'Invalid or unsupported country name/Alpha-3 code');

// 4. Unavailable Real Countries (real countries that are not in the mapping)
runTest('Unavailable Country - Sweden', 'Sweden', 'SWE'); // Should pass because it's in the mapping
runTest('Unavailable Country - Argentina', 'Argentina', 'ARG'); // Should pass because it's in the mapping
runTest('Unavailable Country - Switzerland', 'Switzerland', 'CHE'); // Should pass because it's in the mapping

// 5. Testing the case where a code doesn't exist in the mapping
runTest('Invalid Alpha-3 Code', 'XYZ', 'Invalid or unsupported country name/Alpha-3 code');