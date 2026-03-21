/**
 * Cleanup script for test data created during `npm run test:live`
 *
 * Deletes all records created by security integration tests that have
 * TEST_ prefixed names/content or test-specific slug patterns,
 * and removes uploaded images from storage.
 *
 * Usage:
 *   npm run test:cleanup
 *   or automatically after: npm run test:live
 *
 * Required env vars in tests/.env.test:
 *   NEXT_PUBLIC_SUPABASE_URL       - e.g. https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY   - service role key for admin API access
 *
 * Cleanup strategy:
 *   Deletes records where searchable columns match known test patterns:
 *     - TEST_* prefix (from api-client.js helpers)
 *     - xss-test-*, race-test-*, bearer-* (inline test data)
 *     - Files with TEST_ prefix or timestamp-based names
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), 'tests/.env.test') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLE_CLEANUP = [
    {
        table: 'blog_posts',
        columns: ['title', 'slug'],
        patterns: ['TEST_', 'xss-test-', 'race-test-', 'csrf-test-', 'idor-test-', 'jwt-test-', 'sql-test-', 'auth-test-', 'rate-test-', 'cache-test-', 'host-test-', 'email-test-', 'mass-test-', 'oauth-test-', 'info-test-', 'session-test-', 'bearer-', 'nobearer-'],
    },
    {
        table: 'requests',
        columns: ['name', 'email', 'company'],
        patterns: ['TEST_'],
    },
    {
        table: 'tasks',
        columns: ['title'],
        patterns: ['TEST_', 'E2E Test'],
    },
    {
        table: 'task_comments',
        columns: ['content'],
        patterns: ['TEST_', 'E2E Test'],
    },
    {
        table: 'notifications',
        columns: ['title', 'message'],
        patterns: ['TEST_'],
    },
    {
        table: 'projects',
        columns: ['name'],
        patterns: ['TEST_', 'xss-test-'],
    },
    {
        table: 'settings',
        columns: ['key'],
        patterns: ['TEST_', 'test_setting', 'security_test'],
    },
    {
        table: 'subscribers',
        columns: ['email'],
        patterns: ['TEST_'],
    },
    {
        table: 'testimonials',
        columns: ['client'],
        patterns: ['TEST_'],
    },
];

async function cleanupTable(supabase, config) {
    const { table, columns, patterns } = config;
    let totalDeleted = 0;

    for (const col of columns) {
        const conditions = patterns.map(p => `${col}.ilike.%${p}%`);
        const orCondition = conditions.join(',');

        const { data, error: selectError } = await supabase
            .from(table)
            .select('id')
            .or(orCondition)
            .limit(100);

        if (selectError || !data || data.length === 0) continue;

        const ids = data.map(r => r.id);

        const { error: deleteError, count } = await supabase
            .from(table)
            .delete()
            .in('id', ids)
            .select('id', { count: 'exact' });

        if (!deleteError && count) {
            totalDeleted += count;
        }
    }

    return totalDeleted;
}

async function cleanupStorage(supabase) {
    const { data: files, error: listError } = await supabase
        .storage
        .from('images')
        .list('uploads', { limit: 200 });

    if (listError || !files || files.length === 0) return 0;

    const toDelete = files.filter(f => {
        const name = f.name || '';
        return (
            name.startsWith('TEST_') ||
            /^\d{13}-/.test(name)
        );
    });

    if (toDelete.length === 0) return 0;

    const paths = toDelete.map(f => `uploads/${f.name}`);

    const { error } = await supabase
        .storage
        .from('images')
        .remove(paths);

    return error ? 0 : toDelete.length;
}

async function main() {
    console.log('\n🧹 Test Data Cleanup\n');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing required env vars:');
        if (!SUPABASE_URL) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
        if (!SUPABASE_SERVICE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
        console.error('\nAdd these to tests/.env.test:');
        console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    console.log(`📦 Connected to: ${SUPABASE_URL}\n`);

    let grandTotal = 0;

    console.log('🗄️  Cleaning database tables...\n');
    for (const config of TABLE_CLEANUP) {
        process.stdout.write(`   ${config.table.padEnd(20)} `);
        try {
            const deleted = await cleanupTable(supabase, config);
            if (deleted > 0) {
                console.log(`✅ ${deleted} record(s)`);
                grandTotal += deleted;
            } else {
                console.log(`⏭️  nothing to clean`);
            }
        } catch (e) {
            console.log(`⚠️  ${e.message.split('\n')[0]}`);
        }
    }

    console.log('\n🗄️  Cleaning storage...\n');
    process.stdout.write('   uploads/             ');
    try {
        const deleted = await cleanupStorage(supabase);
        if (deleted > 0) {
            console.log(`✅ ${deleted} file(s)`);
            grandTotal += deleted;
        } else {
            console.log(`⏭️  nothing to clean`);
        }
    } catch (e) {
        console.log(`⚠️  ${e.message.split('\n')[0]}`);
    }

    console.log(`\n✅ Done. ${grandTotal} total record(s)/file(s) removed.\n`);
}

main().catch((e) => {
    console.error('\n❌ Cleanup failed:', e.message);
    process.exit(1);
});
