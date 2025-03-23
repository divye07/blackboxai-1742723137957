const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '../public/models');

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

const MODELS = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
];

const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

async function downloadFile(filename) {
  const filePath = path.join(MODELS_DIR, filename);
  
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${filename}...`);
    
    const file = fs.createWriteStream(filePath);
    https.get(`${BASE_URL}/${filename}`, response => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename} successfully`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {}); // Delete the file if there was an error
      console.error(`Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
}

async function downloadModels() {
  try {
    console.log('Starting model downloads...');
    
    // Download all models concurrently
    await Promise.all(MODELS.map(model => downloadFile(model)));
    
    console.log('All models downloaded successfully!');
    console.log(`Models are located in: ${MODELS_DIR}`);
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

// Add the download script to package.json scripts:
// "download-face-models": "node scripts/download-face-models.js"
downloadModels();