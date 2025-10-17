#!/usr/bin/env tsx

// watch.ts
import ts from 'typescript';
import {runCommand} from '../lib/util.js';

let busy = false
// A simple function to execute after a successful build
async function onSuccessfulBuild() {
  console.log('✅ A successful build has finished. Executing custom function...');
  if (busy) return;
  busy = true
  await runCommand(
    `cp -r resources dist`
  )
  busy = false
}

// 1. Read the tsconfig.json file
const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
if (!configPath) {
  throw new Error("Could not find a valid 'tsconfig.json'.");
}
const { options, fileNames } = ts.parseJsonConfigFileContent(
  ts.readConfigFile(configPath, ts.sys.readFile).config,
  ts.sys,
  './'
);

// 2. A function to report compilation errors
const reportDiagnostic = (diagnostic: ts.Diagnostic) => {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (diagnostic.file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
    console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    console.error(message);
  }
};

// 3. Create the watch compiler host and add the custom hook
const watchCompilerHost = ts.createWatchCompilerHost(
  fileNames,
  options,
  ts.sys,
  ts.createEmitAndSemanticDiagnosticsBuilderProgram,
  reportDiagnostic,
  (diagnostic) => {
    // This callback is called for status messages
    // The specific diagnostic code for 'build complete' is 6194
    if (diagnostic.code === 6194) {
      onSuccessfulBuild();
    }
  }
);

// 4. Create and start the watch program
ts.createWatchProgram(watchCompilerHost);
console.log('TypeScript watching for file changes...');
