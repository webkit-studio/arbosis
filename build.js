#!/usr/bin/env node
/* Sloučí src/modules/*.js do jednoho dist/arbosis.js a zkopíruje src/arbosis.css.
   Bez závislostí. Spuštění: node build.js */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, 'src', 'modules');
const DIST = path.join(__dirname, 'dist');

fs.mkdirSync(DIST, { recursive: true });

const files = fs
  .readdirSync(MODULES_DIR)
  .filter((f) => f.endsWith('.js'))
  .sort();

const header = `/*!
 * Arbosis — sloučený skript webu arbosis.cz
 * Sestaveno z src/modules/ — needituj tento soubor, uprav zdroj a spusť \`node build.js\`.
 * Moduly: ${files.join(', ')}
 */
(function () {
'use strict';
`;

const body = files
  .map((f) => fs.readFileSync(path.join(MODULES_DIR, f), 'utf8').trimEnd())
  .join('\n\n');

fs.writeFileSync(path.join(DIST, 'arbosis.js'), header + '\n' + body + '\n\n})();\n');

const cssSrc = path.join(__dirname, 'src', 'arbosis.css');
if (fs.existsSync(cssSrc)) {
  fs.copyFileSync(cssSrc, path.join(DIST, 'arbosis.css'));
}

const size = fs.statSync(path.join(DIST, 'arbosis.js')).size;
console.log(`dist/arbosis.js  ${size} B  (${files.length} modulů)`);
