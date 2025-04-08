require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const sanitize = require('sanitize-filename');
const EPub = require("epub");  // Import the epub package

const ROOT_DIR = process.env.ROOT_DIR;
if (!ROOT_DIR) {
  console.error('ERROR: ROOT_DIR is not defined in your .env file.');
  process.exit(1);
}

/**
 * Helper function to extract metadata from an EPUB file using the epub module.
 * @param {string} epubPath - Full path to the EPUB file.
 * @returns {Promise<Object>} - Resolves with the metadata object.
 */
function extractEpubMetadata(epubPath) {
  return new Promise((resolve, reject) => {
    const epub = new EPub(epubPath);
    epub.on("error", (err) => reject(err));
    epub.on("end", () => resolve(epub.metadata));
    epub.parse();
  });
}

/**
 * Process a single EPUB file:
 * - Extracts metadata using the epub package.
 * - Constructs destination folder and file names.
 * - Moves (renames) the file accordingly.
 *
 * @param {string} filePath - The full path to the EPUB file.
 */
async function processFile(filePath) {
  try {
    if (path.extname(filePath).toLowerCase() !== '.epub') return;

    console.log(`Processing file: ${filePath}`);

    // Extract metadata with a timeout
    let metadata;
    try {
      metadata = await Promise.race([
        extractEpubMetadata(filePath),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Metadata extraction timed out")), 5000)
        ),
      ]);
      console.log(`Metadata extracted: ${JSON.stringify(metadata)}`);
    } catch (mErr) {
      console.error(`Error extracting metadata for ${filePath}: ${mErr.message}`);
      return;
    }

    // Retrieve and sanitize metadata fields
    const title = metadata.title || "Unknown_Title";
    const author = metadata.creator || metadata.author || "Unknown_Author";
    const series = metadata.series; // Optional field

    const sanitizedTitle = sanitize(title);
    const sanitizedAuthor = sanitize(author);
    const newFileName = `${sanitizedTitle}_${sanitizedAuthor}.epub`;

    // Determine the destination folder based on series (if exists) or author.
    const folderName = series ? sanitize(series) : sanitizedAuthor;
    const destFolder = path.join(ROOT_DIR, folderName);
    console.log(`Destination folder will be: ${destFolder}`);

    // Attempt to create the destination folder
    try {
      await fs.mkdir(destFolder, { recursive: true });
      console.log(`Folder created or already exists: ${destFolder}`);
    } catch (mkdirErr) {
      console.error(`Error creating folder "${destFolder}": ${mkdirErr.message}`);
      return;
    }

    const newFilePath = path.join(destFolder, newFileName);
    console.log(`Attempting to move file to: ${newFilePath}`);

    // Move (rename) the file to the destination folder with the new name.
    try {
      await fs.rename(filePath, newFilePath);
      console.log(`File successfully moved to: ${newFilePath}`);
    } catch (renameErr) {
      console.error(`Error moving file from "${filePath}" to "${newFilePath}": ${renameErr.message}`);
    }
  } catch (error) {
    console.error(`Unhandled error processing file "${filePath}": ${error.stack}`);
  }
}

/**
 * Process all files already in the ROOT_DIR (only files directly inside it).
 */
async function processExistingFiles() {
  try {
    const entries = await fs.readdir(ROOT_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(ROOT_DIR, entry.name);
        await processFile(filePath);
      }
    }
  } catch (error) {
    console.error("Error reading the directory:", error.stack);
  }
}

/**
 * Setup a watcher for new files added to ROOT_DIR (ignoring files in subfolders).
 */
function watchFolder() {
  const watcher = chokidar.watch(ROOT_DIR, {
    // Only watch files directly in the ROOT_DIR.
    ignored: filePath => {
      const relative = path.relative(ROOT_DIR, filePath);
      return relative.includes(path.sep);
    },
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('add', filePath => {
    console.log(`New file detected: ${filePath}`);
    // Delay processing to ensure file is fully written.
    setTimeout(() => processFile(filePath), 1000);
  });

  console.log(`Watching for new EPUB files in ${ROOT_DIR}...`);
}

/**
 * Main function: process existing files on startup then begin watching for new ones.
 */
async function main() {
  console.log("ROOT_DIR is:", ROOT_DIR);
  await processExistingFiles();
  watchFolder();
}

main().catch(error => console.error("Unhandled error in main:", error.stack));
