import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV file
const inputPath = path.join(__dirname, '../public/occurrence_parsed.csv');
const outputPath = path.join(__dirname, '../public/edible_fish.csv');

console.log('Reading CSV file...');
const csvContent = fs.readFileSync(inputPath, 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0];

console.log('Total rows:', lines.length - 1);

// Edible fish families
const edibleFamilies = [
  'scombridae', // Tuna, mackerel
  'serranidae', // Groupers
  'lutjanidae', // Snappers
  'carangidae', // Jacks, trevally
  'haemulidae', // Grunts
  'lethrinidae', // Emperors
  'nemipteridae', // Threadfin breams
  'caesionidae', // Fusiliers
  'siganidae', // Rabbitfish
  'mugilidae', // Mullets
  'sphyraenidae', // Barracudas
  'belonidae', // Needlefish
  'exocoetidae', // Flying fish
  'istiophoridae', // Marlins
  'coryphaenidae', // Mahi-mahi
  'rachycentridae', // Cobia
  'pomatomidae', // Bluefish
  'centropomidae', // Snooks
  'polynemidae', // Threadfins
  'sciaenidae', // Drums/croakers
  'sparidae', // Breams/porgies
  'mullidae', // Goatfish
  'priacanthidae', // Bigeyes
  'holocentridae', // Squirrelfish
  'kyphosidae', // Sea chubs
  'acanthuridae', // Surgeonfish (some edible)
];

const edibleGenera = [
  'thunnus', 'katsuwonus', 'euthynnus', 'auxis', 'sarda', // Tunas
  'epinephelus', 'cephalopholis', 'plectropomus', // Groupers
  'lutjanus', // Snappers
  'caranx', 'carangoides', 'seriola', // Jacks
  'lates', // Barramundi
];

// Parse header to get column indices
const headerCols = headers.split(',').map(h => h.trim());
const classIndex = headerCols.indexOf('class');
const familyIndex = headerCols.indexOf('family');
const genusIndex = headerCols.indexOf('genus');
const scientificNameIndex = headerCols.indexOf('scientificName');

console.log('Column indices - class:', classIndex, 'family:', familyIndex, 'genus:', genusIndex);

// Filter edible fish
const edibleLines = [headers]; // Start with header

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const cols = line.split(',');

  const className = (cols[classIndex] || '').toLowerCase();
  const family = (cols[familyIndex] || '').toLowerCase();
  const genus = (cols[genusIndex] || '').toLowerCase();
  const scientificName = (cols[scientificNameIndex] || '').toLowerCase();

  // Must be a fish class
  if (!className.includes('actinopteri') &&
      !className.includes('actinopterygii') &&
      !className.includes('chondrichthyes')) {
    continue;
  }

  // Check if edible
  let isEdible = false;

  // Check family
  for (const edibleFamily of edibleFamilies) {
    if (family.includes(edibleFamily)) {
      isEdible = true;
      break;
    }
  }

  // Check genus if not already edible
  if (!isEdible) {
    for (const edibleGenus of edibleGenera) {
      if (genus.includes(edibleGenus) || scientificName.includes(edibleGenus)) {
        isEdible = true;
        break;
      }
    }
  }

  if (isEdible) {
    edibleLines.push(line);
  }
}

console.log('Edible fish rows:', edibleLines.length - 1);

// Write to new CSV
fs.writeFileSync(outputPath, edibleLines.join('\n'), 'utf-8');
console.log('Edible fish CSV created at:', outputPath);
console.log('Percentage of original:', ((edibleLines.length - 1) / (lines.length - 1) * 100).toFixed(2) + '%');
