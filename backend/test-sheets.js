import sheetsService from './services/sheetsService.js';

async function testSheets() {
  try {
    console.log('Testing Google Sheets connection...');
    await sheetsService.initialize();
    console.log('✅ Google Sheets initialized successfully');

    // Try to get some data
    const data = await sheetsService.getData('AllReceipts!A1:A5');
    console.log('✅ Data retrieved:', data);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSheets();