import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV file
const inputPath = path.join(__dirname, '../public/occurrence_parsed.csv');
const outputPath = path.join(__dirname, '../public/all_fish.csv');

console.log('Reading CSV file...');
const csvContent = fs.readFileSync(inputPath, 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0];

console.log('Total rows:', lines.length - 1);

// Parse header to get column indices
const headerCols = headers.split(',').map(h => h.trim());
const classIndex = headerCols.indexOf('class');

console.log('Column index - class:', classIndex);

// Filter all fish (any fish class)
const fishLines = [headers]; // Start with header

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const cols = line.split(',');
  const className = (cols[classIndex] || '').toLowerCase();

  // Include all fish classes
  if (className.includes('actinopteri') ||
      className.includes('actinopterygii') ||
      className.includes('chondrichthyes') ||
      className.includes('myxini') ||
      className.includes('petromyzonti')) {
    fishLines.push(line);
  }
}

console.log('All fish rows:', fishLines.length - 1);

// Write to new CSV
fs.writeFileSync(outputPath, fishLines.join('\n'), 'utf-8');
console.log('All fish CSV created at:', outputPath);
console.log('Percentage of original:', ((fishLines.length - 1) / (lines.length - 1) * 100).toFixed(2) + '%');
