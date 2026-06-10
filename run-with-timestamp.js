const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'healthcare_app.log');

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
}

function writeToLog(text) {
  try {
    fs.appendFileSync(logFilePath, text);
  } catch (err) {
    // Ignore logging errors to prevent crash
  }
}

// Spawn npm run start
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(npmCmd, ['run', 'start'], {
  cwd: __dirname,
  shell: true
});

let stdoutBuffer = '';
child.stdout.on('data', (data) => {
  stdoutBuffer += data.toString();
  const lines = stdoutBuffer.split(/\r?\n/);
  stdoutBuffer = lines.pop(); // Keep partial line
  
  const timestamp = getTimestamp();
  if (lines.length > 0) {
    const formatted = lines.map(line => `${timestamp} ${line}`).join('\n') + '\n';
    writeToLog(formatted);
  }
});

let stderrBuffer = '';
child.stderr.on('data', (data) => {
  stderrBuffer += data.toString();
  const lines = stderrBuffer.split(/\r?\n/);
  stderrBuffer = lines.pop(); // Keep partial line
  
  const timestamp = getTimestamp();
  if (lines.length > 0) {
    const formatted = lines.map(line => `${timestamp} ${line}`).join('\n') + '\n';
    writeToLog(formatted);
  }
});

child.on('error', (err) => {
  writeToLog(`${getTimestamp()} ERROR: Failed to start process: ${err.message}\n`);
});

child.on('close', (code) => {
  const timestamp = getTimestamp();
  if (stdoutBuffer) {
    writeToLog(`${timestamp} ${stdoutBuffer}\n`);
  }
  if (stderrBuffer) {
    writeToLog(`${timestamp} ${stderrBuffer}\n`);
  }
  writeToLog(`${timestamp} PROCESS EXITED with code ${code}\n`);
});
