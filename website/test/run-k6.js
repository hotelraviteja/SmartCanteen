import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting mock servers...');
const mockProcess = spawn('node', [path.join(__dirname, 'mock-servers.js')], { stdio: 'inherit', shell: true });

// Wait 1.5 seconds for the mock servers to start
setTimeout(() => {
  console.log('Running k6 load test...');
  const k6Process = spawn('k6', [
    'run',
    '--summary-export=website/test/reports/summary.json',
    'website/test/k6-load-test.js'
  ], { stdio: 'inherit', shell: true });

  k6Process.on('close', (code) => {
    console.log(`k6 finished with exit code ${code}`);
    console.log('Stopping mock servers...');
    mockProcess.kill();
    process.exit(code);
  });
}, 1500);
