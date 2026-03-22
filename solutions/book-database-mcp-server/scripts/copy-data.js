// generated-by-copilot: Copy data files from src to dist during build
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const srcDataDir = path.join(projectRoot, 'src', 'data');
const distDataDir = path.join(projectRoot, 'dist', 'data');

async function copyDataFiles() {
  try {
    // Create dist/data directory if it doesn't exist
    await fs.mkdir(distDataDir, { recursive: true });

    // Copy all JSON files from src/data to dist/data
    const files = await fs.readdir(srcDataDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    for (const file of jsonFiles) {
      const srcPath = path.join(srcDataDir, file);
      const distPath = path.join(distDataDir, file);
      await fs.copyFile(srcPath, distPath);
      console.log(`✓ Copied ${file} to dist/data/`);
    }

    console.log(`\nSuccessfully copied ${jsonFiles.length} data file(s).`);
  } catch (error) {
    console.error('Error copying data files:', error);
    process.exit(1);
  }
}

copyDataFiles();
