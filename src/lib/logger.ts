import fs from 'fs';
import path from 'path';

export function auditLog(stage: string, data: any) {
  const logPath = path.join(process.cwd(), 'system_deep_audit.log');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${stage.toUpperCase()}] ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n---\n`;
  
  try {
    fs.appendFileSync(logPath, entry);
    console.log(`[AUDIT] ${stage} logged.`);
  } catch (err) {
    console.error('[AUDIT] Failed to write log:', err);
  }
}
