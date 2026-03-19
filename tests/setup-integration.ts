import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'tests/.env.test') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔒 Security Integration Tests Setup');
console.log('   These tests require the dev server to be running on http://localhost:3000');
console.log('   Run: npm run test:security:api:live');
