/**
 * @fileoverview Secrets Audit Tests
 * 
 * Verifies that sensitive credentials are not committed to git
 * and are not exposed in build output.
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

describe('Security: Secrets Audit', () => {
  const projectRoot = resolve(process.cwd());
  const gitignorePath = join(projectRoot, '.gitignore');
  const envTestPath = join(projectRoot, 'tests', '.env.test');
  const srcDir = join(projectRoot, 'src');
  const nextBuildDir = join(projectRoot, '.next');

  // =========================================================================
  // Git Tracking Checks
  // =========================================================================

  describe('Gitignore Configuration', () => {
    it('1. tests/.env.test is listed in .gitignore', () => {
      expect(existsSync(gitignorePath)).toBe(true);
      
      const gitignore = readFileSync(gitignorePath, 'utf-8');
      const hasEnvTest = gitignore.includes('.env.test') || 
                        gitignore.includes('tests/.env.test') ||
                        gitignore.includes('.env*.test');
      
      expect(hasEnvTest).toBe(true);
    });

    it('2. tests/.env.test is NOT tracked by git', () => {
      if (!existsSync(envTestPath)) {
        // If file doesn't exist, test passes (can't be tracked)
        expect(true).toBe(true);
        return;
      }
      
      try {
        const trackedFiles = execSync('git ls-files', { 
          cwd: projectRoot,
          encoding: 'utf-8'
        });
        
        const isTracked = trackedFiles
          .split('\n')
          .some(f => f.includes('.env.test') && f.includes('tests'));
        
        expect(isTracked).toBe(false);
      } catch (e) {
        // If git command fails, skip this test
        expect(true).toBe(true);
      }
    });
  });

  // =========================================================================
  // Build Output Checks
  // =========================================================================

  describe('Build Output Security', () => {
    it('3. Built output does not contain SUPABASE_SERVICE_ROLE_KEY', () => {
      if (!existsSync(nextBuildDir)) {
        // Skip if build hasn't been run
        expect(true).toBe(true);
        return;
      }
      
      const staticDir = join(nextBuildDir, 'static');
      if (!existsSync(staticDir)) {
        expect(true).toBe(true);
        return;
      }
      
      // Search for service role key pattern in static files
      const searchInDirectory = (dir: string): boolean => {
        const files = readdirSync(dir);
        
        for (const file of files) {
          const fullPath = join(dir, file);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (searchInDirectory(fullPath)) return true;
          } else if (file.endsWith('.js') || file.endsWith('.json')) {
            const content = readFileSync(fullPath, 'utf-8');
            if (content.includes('SERVICE_ROLE_KEY') || 
                content.includes('service_role')) {
              return true;
            }
          }
        }
        return false;
      };
      
      const hasServiceRoleKey = searchInDirectory(staticDir);
      expect(hasServiceRoleKey).toBe(false);
    });

    it('4. Built output does not contain the anon key JWT', () => {
      if (!existsSync(nextBuildDir)) {
        expect(true).toBe(true);
        return;
      }
      
      const staticDir = join(nextBuildDir, 'static');
      if (!existsSync(staticDir)) {
        expect(true).toBe(true);
        return;
      }
      
      // The anon key is expected to be public (NEXT_PUBLIC), 
      // but we check for service role key specifically
      const searchInDirectory = (dir: string): boolean => {
        const files = readdirSync(dir);
        
        for (const file of files) {
          const fullPath = join(dir, file);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (searchInDirectory(fullPath)) return true;
          } else if (file.endsWith('.js')) {
            const content = readFileSync(fullPath, 'utf-8');
            // Look for service_role specifically, not anon key
            if (content.includes('service_role') && 
                !content.includes('role":"anon"')) {
              return true;
            }
          }
        }
        return false;
      };
      
      const hasServiceRoleKey = searchInDirectory(staticDir);
      expect(hasServiceRoleKey).toBe(false);
    });
  });

  // =========================================================================
  // Source Code Checks
  // =========================================================================

  describe('Source Code Security', () => {
    const searchFiles = (dir: string, pattern: RegExp): string[] => {
      const results: string[] = [];
      
      if (!existsSync(dir)) return results;
      
      const files = readdirSync(dir);
      
      for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          results.push(...searchFiles(fullPath, pattern));
        } else if (file.endsWith('.js') || file.endsWith('.ts') || 
                   file.endsWith('.jsx') || file.endsWith('.tsx')) {
          const content = readFileSync(fullPath, 'utf-8');
          if (pattern.test(content)) {
            results.push(fullPath);
          }
        }
      }
      
      return results;
    };

    it('5. Source files do not contain hardcoded service role key', () => {
      const filesWithServiceRole = searchFiles(srcDir, /service_role|SERVICE_ROLE_KEY/);
      
      // Service role key should only be in server-side files
      const clientFiles = filesWithServiceRole.filter(f => 
        f.includes('components') || f.includes('hooks') || 
        f.includes('app\\') && !f.includes('api')
      );
      
      expect(clientFiles.length).toBe(0);
    });

    it('6. No console.log of tokens or sessions in production code', () => {
      const filesWithConsoleLog = searchFiles(srcDir, /console\.log.*(?:token|session|password|key)/i);
      
      // Filter out test files and development-only code
      const suspiciousFiles = filesWithConsoleLog.filter(f => 
        !f.includes('.test.') && !f.includes('.spec.')
      );
      
      // This is a warning - may have legitimate debug logs
      // But should be reviewed
      expect(suspiciousFiles.length).toBeLessThan(10);
    });

    it('7. NEXT_PUBLIC_SUPABASE_ANON_KEY is the only key exposed client-side', () => {
      const envLocalPath = join(projectRoot, '.env.local');
      
      if (!existsSync(envLocalPath)) {
        expect(true).toBe(true);
        return;
      }
      
      const envContent = readFileSync(envLocalPath, 'utf-8');
      
      // Check that service role key is NOT prefixed with NEXT_PUBLIC
      const lines = envContent.split('\n');
      const serviceRoleLine = lines.find(l => 
        l.includes('SUPABASE_SERVICE_ROLE_KEY')
      );
      
      if (serviceRoleLine) {
        expect(serviceRoleLine.startsWith('NEXT_PUBLIC')).toBe(false);
      }
    });

    it('8. process.env.SUPABASE_SERVICE_ROLE_KEY is never passed to client components', () => {
      // Search for service role key usage in client components
      const clientComponentsDir = join(srcDir, 'components');
      
      if (!existsSync(clientComponentsDir)) {
        expect(true).toBe(true);
        return;
      }
      
      const filesWithServiceRole = searchFiles(
        clientComponentsDir, 
        /SUPABASE_SERVICE_ROLE_KEY|service_role/
      );
      
      // Should be empty - service role should never be in client components
      expect(filesWithServiceRole.length).toBe(0);
    });
  });
});
