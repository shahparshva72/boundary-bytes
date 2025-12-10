// SQL validation service for text-to-SQL feature
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Dangerous SQL keywords that should never be allowed
const DANGEROUS_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'CREATE',
  'ALTER',
  'TRUNCATE',
  'EXEC',
  'EXECUTE',
  'DECLARE',
  'GRANT',
  'REVOKE',
  'COMMIT',
  'ROLLBACK',
  'SAVEPOINT',
  'MERGE',
  'CALL',
  'REPLACE',
  'LOAD',
  'COPY',
  'BULK',
  'BACKUP',
  'RESTORE',
  'ATTACH',
  'DETACH',
];

// Allowed table names from WPL cricket schema
const ALLOWED_TABLES = [
  'wpl_match',
  'wpl_delivery',
  'wpl_match_info',
  'wpl_team',
  'wpl_player',
  'wpl_official',
  'wpl_person_registry',
];

// System tables and schemas that should never be accessed
const FORBIDDEN_PATTERNS = [
  /information_schema/i,
  /pg_/i,
  /sys\./i,
  /master\./i,
  /msdb\./i,
  /tempdb\./i,
];

export class SqlValidator {
  /**
   * Validates if a SQL query is safe to execute
   */
  validateSql(sql: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic null/empty check
    if (!sql || sql.trim().length === 0) {
      errors.push('SQL query cannot be empty');
      return { isValid: false, errors, warnings };
    }

    const normalizedSql = sql.trim().toUpperCase();

    // Check for dangerous keywords
    if (this.isDangerousQuery(sql)) {
      errors.push('Query contains dangerous keywords. Only SELECT statements are allowed.');
    }

    // Check if query starts with SELECT or WITH
    if (!(normalizedSql.startsWith('SELECT') || normalizedSql.startsWith('WITH'))) {
      errors.push('Only SELECT queries are allowed');
    }

    // Check for forbidden system tables/schemas
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(sql)) {
        errors.push('Access to system tables/schemas is not allowed');
        break;
      }
    }

    // Validate table names (basic check)
    const tableValidation = this.validateTableNames(sql);
    if (!tableValidation.isValid) {
      errors.push(...tableValidation.errors);
    }

    // Check for potential SQL injection patterns
    const injectionCheck = this.checkForInjectionPatterns(sql);
    if (!injectionCheck.isValid) {
      errors.push(...injectionCheck.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Checks if a query contains dangerous keywords
   */
  isDangerousQuery(sql: string): boolean {
    const normalizedSql = sql.toUpperCase();
    return DANGEROUS_KEYWORDS.some((keyword) => normalizedSql.includes(keyword));
  }

  /**
   * Validates that only allowed tables are referenced
   */
  validateTableNames(sql: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const cteNames = Array.from(sql.matchAll(/\b([A-Za-z_"][A-Za-z0-9_".]*)\s+AS\s*\(/gi)).map(
      (m) => (m[1] || '').replace(/"/g, '').split('.').pop()!.toLowerCase(),
    );
    const cteSet = new Set(cteNames);

    const tableMatches = sql.match(/(?:FROM|JOIN)\s+(\w+)/gi);

    if (tableMatches) {
      for (const match of tableMatches) {
        const tableName = match.replace(/(?:FROM|JOIN)\s+/i, '').trim();
        const base = tableName.includes('.')
          ? tableName.split('.')[tableName.split('.').length - 1]
          : tableName;
        const baseLower = base.toLowerCase();
        if (!(cteSet.has(baseLower) || this.isAllowedTable(baseLower))) {
          errors.push(
            `Table '${tableName}' is not allowed. Only WPL cricket tables are accessible.`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Checks if a table name is in the allowed list
   */
  isAllowedTable(tableName: string): boolean {
    const cleaned = tableName.replace(/"/g, '');
    const base = cleaned.includes('.')
      ? cleaned.split('.')[cleaned.split('.').length - 1]
      : cleaned;
    return ALLOWED_TABLES.includes(base.toLowerCase());
  }

  /**
   * Checks for common SQL injection patterns
   */
  private checkForInjectionPatterns(sql: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Common injection patterns
    const injectionPatterns = [
      /;\s*--/i, // Comment injection
      /;\s*\/\*/i, // Block comment injection
      /union\s+select/i, // Union-based injection
      /'\s*or\s*'1'\s*=\s*'1/i, // Classic OR injection
      /'\s*or\s*1\s*=\s*1/i, // Numeric OR injection
      /xp_cmdshell/i, // Command execution
      /sp_executesql/i, // Dynamic SQL execution
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(sql)) {
        errors.push('Query contains potentially malicious patterns');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Export singleton instance
export const sqlValidator = new SqlValidator();
