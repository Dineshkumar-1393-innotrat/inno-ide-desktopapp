import { spawn } from 'child_process';
import { logger } from '../utils/logger.js';

export class ProcessService {
  constructor() {
    this.runningProcesses = new Map();
  }

  execute(command, args = [], options = {}, onStdout, onStderr, onExit) {
    try {
      const processId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      const child = spawn(command, args, {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        shell: false
      });

      this.runningProcesses.set(processId, child);
      logger.info(`Process started [${processId}]: ${command} ${args.join(' ')}`);

      if (child.stdout) {
        child.stdout.on('data', data => {
          const text = data.toString('utf8');
          if (onStdout) onStdout(processId, text);
        });
      }

      if (child.stderr) {
        child.stderr.on('data', data => {
          const text = data.toString('utf8');
          if (onStderr) onStderr(processId, text);
        });
      }

      child.on('close', code => {
        this.runningProcesses.delete(processId);
        logger.info(`Process exited [${processId}] with code ${code}`);
        if (onExit) onExit(processId, code);
      });

      child.on('error', err => {
        this.runningProcesses.delete(processId);
        logger.error(`Process error [${processId}]:`, err.message);
        if (onStderr) onStderr(processId, `Process error: ${err.message}\n`);
        if (onExit) onExit(processId, -1);
      });

      return processId;
    } catch (error) {
      logger.error(`Failed to spawn process ${command}:`, error.message);
      throw error;
    }
  }

  cancel(processId) {
    const child = this.runningProcesses.get(processId);
    if (child) {
      child.kill('SIGTERM');
      this.runningProcesses.delete(processId);
      logger.info(`Killed process [${processId}]`);
      return { success: true, processId };
    }
    return { success: false, message: 'Process not found' };
  }
}

export const processService = new ProcessService();
