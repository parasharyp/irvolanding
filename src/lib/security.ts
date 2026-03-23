/**
 * Security utilities — used by the proxy and API routes.
 * All detection is done server-side; nothing here is sent to the browser.
 *
 * NOTE: This file must remain Edge Runtime compatible.
 * Do NOT import Node.js built-ins (crypto, fs, path, etc.).
 * Use the Web Crypto API globals instead — available in both Edge and Node runtimes.
 */

// ─── Request ID ──────────────────────────────────────────────────────────────

/** Generates a cryptographically random request ID for tracing. */
export function generateRequestId(): string {
  // crypto.randomUUID() is a Web Crypto API global — works in Edge Runtime and Node.js.
  return crypto.randomUUID().replace(/-/g, '')
}

// ─── IP extraction ───────────────────────────────────────────────────────────

/** Extracts the real client IP from Vercel/Cloudflare forwarded headers. */
export function extractIp(headers: { get(name: string): string | null }): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}

// ─── Scanner / attack path detection ────────────────────────────────────────

/**
 * Paths that should never exist in a Next.js app.
 * Any request to these is an automated scanner or exploit attempt.
 * We return 404 silently — never hint that we detected the probe.
 */
const SCANNER_PATH_PREFIXES: string[] = [
  // WordPress probes (most common scanner traffic)
  '/wp-admin', '/wp-login', '/wp-content', '/wp-includes', '/wordpress',
  // DB admin panels
  '/phpmyadmin', '/pma', '/myadmin', '/dbadmin', '/mysql', '/adminer',
  // Config / secrets
  '/.env', '/.env.local', '/.env.production', '/.git', '/.svn', '/.hg',
  '/.htaccess', '/.htpasswd', '/.bash_history', '/.ssh', '/.aws',
  // PHP backdoors
  '/shell', '/cmd', '/backdoor', '/webshell', '/c99', '/r57',
  '/phpinfo', '/info.php', '/test.php', '/eval.php',
  '/config.php', '/configuration.php', '/settings.php', '/setup.php',
  '/install.php', '/upgrade.php', '/admin.php', '/login.php',
  '/xmlrpc.php', '/xmlrpc',
  // Spring Boot / Java actuator leaks
  '/actuator', '/actuator/health', '/actuator/env', '/h2-console', '/console',
  // AWS / cloud metadata
  '/latest/meta-data', '/169.254.169.254',
  // Backup / dump files
  '/backup', '/bak', '/sql', '/dump', '/db.sql', '/database.sql',
  '/index.php', '/index.bak', '/site.zip', '/www.zip',
  // Framework fingerprints
  '/rails/info', '/telescope', '/horizon', '/_profiler',
]

/** Returns true if the path looks like a scanner probe or exploit attempt. */
export function isScannerPath(pathname: string): boolean {
  const lower = pathname.toLowerCase()
  return SCANNER_PATH_PREFIXES.some(
    (p) => lower === p || lower.startsWith(p + '/') || lower.startsWith(p + '?')
  )
}

// ─── Injection pattern detection ─────────────────────────────────────────────

/**
 * Patterns associated with known attack classes.
 * Checked against the full decoded URL string.
 */
const ATTACK_PATTERNS: RegExp[] = [
  /\.\.[/\\]/,                            // path traversal: ../
  /%2e%2e[%2f%5c]/i,                      // encoded path traversal
  /<script[^>]*>/i,                        // XSS: <script> in URL
  /UNION\s+ALL?\s+SELECT/i,               // SQL injection: UNION SELECT
  /;\s*(DROP|DELETE|TRUNCATE)\s+/i,       // SQL DDL injection
  /\bOR\s+['"]?1['"]?\s*=\s*['"]?1/i,   // SQL: OR 1=1
  /\bexec\s*\(\s*['"]/i,                  // Command injection: exec('
  /base64_decode\s*\(/i,                  // PHP RCE: base64_decode(
  /\/etc\/passwd/i,                        // LFI: /etc/passwd
  /\/proc\/self\/environ/i,               // LFI: /proc/self
  /\$\{.*?\}/,                            // JNDI / template injection
  /\{\{.*?\}\}/,                          // SSTI: {{...}}
  /javascript\s*:/i,                       // JS protocol injection
  /data\s*:\s*text\/html/i,              // data: URI injection
]

/** Returns true if the raw URL contains patterns matching known attack classes. */
export function hasAttackPattern(rawUrl: string): boolean {
  try {
    // Check both encoded and decoded forms
    const decoded = decodeURIComponent(rawUrl)
    return ATTACK_PATTERNS.some((p) => p.test(rawUrl) || p.test(decoded))
  } catch {
    // Non-decodable URL — block it; legitimate requests are always decodable
    return true
  }
}

// ─── Suspicious User-Agent detection ────────────────────────────────────────

/**
 * User-agents associated with automated scanners and exploit frameworks.
 * Legitimate browsers and crawlers (Google, Bing) are not included.
 */
const SCANNER_UA_FRAGMENTS: string[] = [
  'sqlmap',       // SQLMap
  'nikto',        // Nikto web scanner
  'nmap',         // Nmap NSE scripts
  'masscan',      // Masscan
  'zgrab',        // ZGrab
  'nuclei',       // Nuclei templates
  'metasploit',   // Metasploit
  'dirbuster',    // DirBuster
  'gobuster',     // Gobuster
  'wfuzz',        // WFuzz
  'burpsuite',    // Burp Suite active scan
  'acunetix',     // Acunetix
  'nessus',       // Nessus
  'openvas',      // OpenVAS
  'qualysguard',  // Qualys
  'w3af',         // W3AF
  'havij',        // Havij SQL tool
  'python-httpx', // raw Python scraping
  'go-http-client/1', // raw Go scanning
  'curl/',        // raw curl (in prod context only)
  'wget/',        // wget probing
]

/** Returns true if the user-agent matches a known scanner. */
export function isScannerUserAgent(ua: string | null): boolean {
  if (!ua) return false
  const lower = ua.toLowerCase()
  return SCANNER_UA_FRAGMENTS.some((f) => lower.includes(f))
}
