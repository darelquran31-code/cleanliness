import sheetsService from './services/sheetsService.js';

(async () => {
  try {
    console.log('🔄 Testing Google Sheets connection...');
    await sheetsService.initialize();
    console.log('✅ Connection successful');

    // Try to get some data
    const data = await sheetsService.getData('Users!A1');
    console.log('📊 Sample data:', data);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Stack:', error.stack);
  }
})();