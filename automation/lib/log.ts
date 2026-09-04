import { appendFileSync } from 'node:fs';

// Defense in depth for trusted local output, not a general-purpose DLP system.
export function makeRedactor(
  env: NodeJS.ProcessEnv = process.env,
): (text: string) => string {
  const secrets = Object.entries(env)
    .filter(
      ([name, value]) =>
        /key|token|secret|password|credential|auth/i.test(name) &&
        value &&
        value.length >= 4,
    )
    .map(([, value]) => value!)
    .sort((a, b) => b.length - a.length);
  return (text) => {
    let output = text;
    for (const secret of secrets)
      output = output.split(secret).join('[REDACTED]');
    return output
      .replace(
        /-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,
        '[REDACTED PRIVATE KEY]',
      )
      .replace(/\bsk-[A-Za-z0-9_-]+/g, '[REDACTED]')
      .replace(/\bBearer\s+[^\s"\\]+/gi, 'Bearer [REDACTED]')
      .replace(
        /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
        '[REDACTED JWT]',
      )
      .replace(
        /((?:api[_-]?key|access[_-]?token|password|secret)\s*[=:]\s*)[^\s,;]+/gi,
        '$1[REDACTED]',
      );
  };
}

export function createLog(
  filename: string,
  redact: (text: string) => string,
): (value: unknown) => void {
  return (value) => {
    // Redact before serialization, since JSON escaping can alter secret strings.
    const clean = JSON.parse(
      JSON.stringify(value, (_key, item: unknown) =>
        typeof item === 'string' ? redact(item) : item,
      ),
    ) as unknown;
    appendFileSync(
      filename,
      `${JSON.stringify({ time: new Date().toISOString(), event: clean })}\n`,
      { mode: 0o600 },
    );
  };
}
