import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteDir = path.join(root, 'public', 'assets', 'site');
const originalsDir = path.join(root, '.asset-originals', 'public', 'assets', 'site');
const textRoots = [path.join(root, 'src')];

const imageExts = new Set(['.jpg', '.jpeg', '.png', '.gif']);
const videoExts = new Set(['.mp4', '.webm']);
const imageMappings = new Map();
const removedAssetNames = new Set();

const requiredTools = ['ffmpeg', 'ffprobe', 'cwebp'];

for (const tool of requiredTools) {
  const result = spawnSync('/usr/bin/env', ['which', tool], { stdio: 'ignore' });
  if (result.status !== 0) {
    throw new Error(`Missing required asset optimization tool: ${tool}`);
  }
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function run(command, args, label) {
  const result = spawnSync(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.status !== 0) {
    const stderr = result.stderr.toString().trim();
    throw new Error(`${label} failed${stderr ? `: ${stderr}` : ''}`);
  }
  return result.stdout.toString();
}

function runOptional(command, args) {
  return spawnSync(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
}

function fileSize(filePath) {
  return statSync(filePath).size;
}

function ensureOriginal(filePath) {
  const relative = path.relative(siteDir, filePath);
  const backupPath = path.join(originalsDir, relative);
  if (!existsSync(backupPath)) {
    mkdirSync(path.dirname(backupPath), { recursive: true });
    copyFileSync(filePath, backupPath);
  }
  return backupPath;
}

function hasOriginalBackup(filePath) {
  return existsSync(path.join(originalsDir, path.relative(siteDir, filePath)));
}

function cleanupStaleTemps() {
  if (!existsSync(siteDir)) {
    return;
  }

  for (const filePath of walk(siteDir)) {
    if (filePath.endsWith('.tmp.webp') || filePath.endsWith('.optimizing.mp4')) {
      rmSync(filePath, { force: true });
    }
  }
}

function getVideoSize(filePath) {
  const output = run(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'csv=s=x:p=0',
      filePath,
    ],
    `ffprobe ${path.basename(filePath)}`,
  ).trim();
  const [width, height] = output.split('x').map((value) => Number.parseInt(value, 10));
  return { width, height };
}

function even(value) {
  return Math.max(2, Math.round(value / 2) * 2);
}

function optimizeMp4(filePath) {
  if (hasOriginalBackup(filePath)) {
    return { before: fileSize(filePath), after: fileSize(filePath), skipped: true };
  }

  ensureOriginal(filePath);

  const before = fileSize(filePath);
  const tempPath = `${filePath}.optimizing.mp4`;
  const { width, height } = getVideoSize(filePath);
  const args = ['-y', '-i', filePath, '-map', '0:v:0', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '29'];

  if (width > 1600) {
    const targetWidth = 1600;
    const targetHeight = even((height * targetWidth) / width);
    args.push('-vf', `scale=${targetWidth}:${targetHeight}`);
  }

  args.push('-pix_fmt', 'yuv420p', '-movflags', '+faststart', tempPath);
  run('ffmpeg', args, `mp4 optimize ${path.basename(filePath)}`);

  const after = fileSize(tempPath);
  if (after < before) {
    rmSync(filePath);
    copyFileSync(tempPath, filePath);
  }
  rmSync(tempPath, { force: true });

  return { before, after: fileSize(filePath) };
}

function convertImage(filePath) {
  ensureOriginal(filePath);

  const ext = path.extname(filePath).toLowerCase();
  const newPath = filePath.slice(0, -ext.length) + '.webp';
  const tempPath = `${newPath}.tmp.webp`;

  if (ext === '.gif') {
    run(
      'ffmpeg',
      [
        '-y',
        '-i',
        filePath,
        '-loop',
        '0',
        '-an',
        '-c:v',
        'libwebp',
        '-quality',
        '78',
        '-compression_level',
        '6',
        '-preset',
        'picture',
        tempPath,
      ],
      `gif to webp ${path.basename(filePath)}`,
    );
  } else {
    const cwebp = runOptional('cwebp', ['-quiet', '-q', '82', '-m', '6', filePath, '-o', tempPath]);
    if (cwebp.status !== 0) {
      run(
        'ffmpeg',
        [
          '-y',
          '-i',
          filePath,
          '-frames:v',
          '1',
          '-an',
          '-c:v',
          'libwebp',
          '-quality',
          '82',
          '-compression_level',
          '6',
          '-preset',
          'picture',
          '-f',
          'webp',
          tempPath,
        ],
        `fallback webp ${path.basename(filePath)}`,
      );
    }
  }

  if (!existsSync(tempPath)) {
    throw new Error(`No optimized image was written for ${path.basename(filePath)}`);
  }

  rmSync(filePath);
  copyFileSync(tempPath, newPath);
  rmSync(tempPath, { force: true });

  imageMappings.set(path.basename(filePath), path.basename(newPath));
}

function restoreResumeMappings() {
  if (!existsSync(originalsDir)) {
    return;
  }

  for (const filePath of walk(originalsDir)) {
    const ext = path.extname(filePath).toLowerCase();
    if (!imageExts.has(ext)) {
      continue;
    }

    const relative = path.relative(originalsDir, filePath);
    const publicOriginal = path.join(siteDir, relative);
    const publicWebp = publicOriginal.slice(0, -ext.length) + '.webp';
    if (!existsSync(publicOriginal) && existsSync(publicWebp)) {
      imageMappings.set(path.basename(publicOriginal), path.basename(publicWebp));
    }
  }
}

function removeWebm(filePath) {
  ensureOriginal(filePath);
  removedAssetNames.add(path.basename(filePath));
  rmSync(filePath);
}

function updateTextReferences() {
  const replacements = [...imageMappings.entries()];
  const removed = [...removedAssetNames];

  for (const rootDir of textRoots) {
    for (const filePath of walk(rootDir)) {
      const ext = path.extname(filePath).toLowerCase();
      if (!['.astro', '.css', '.html', '.js', '.json', '.md', '.mdx', '.mjs', '.ts'].includes(ext)) {
        continue;
      }

      let text = readFileSync(filePath, 'utf8');
      const original = text;

      for (const [fromName, toName] of replacements) {
        text = text.split(fromName).join(toName);
      }

      for (const fileName of removed) {
        const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        text = text
          .replace(new RegExp(`,?/assets/site/${escaped}`, 'g'), '')
          .replace(new RegExp(`<source\\s+src=["']/assets/site/${escaped}["']>`, 'g'), '')
          .replace(new RegExp(`<source\\s+src=["']/assets/site/${escaped}["']\\s*/>`, 'g'), '');
      }

      text = text.replace(/<source\s+src=["']["']\s*\/?>/g, '');

      if (text !== original) {
        writeFileSync(filePath, text);
      }
    }
  }
}

cleanupStaleTemps();
const assets = walk(siteDir);
restoreResumeMappings();
let imageBefore = 0;
let imageAfter = 0;
let mp4Before = 0;
let mp4After = 0;
let removedWebmBytes = 0;
let convertedImages = 0;
let optimizedMp4s = 0;
let removedWebms = 0;

for (const filePath of assets) {
  const ext = path.extname(filePath).toLowerCase();
  if (!imageExts.has(ext)) {
    continue;
  }

  imageBefore += fileSize(filePath);
  convertImage(filePath);
  imageAfter += fileSize(filePath.slice(0, -ext.length) + '.webp');
  convertedImages += 1;
  if (convertedImages % 100 === 0) {
    console.log(`Converted ${convertedImages} images...`);
  }
}

for (const filePath of assets) {
  const ext = path.extname(filePath).toLowerCase();
  if (!videoExts.has(ext) || !existsSync(filePath)) {
    continue;
  }

  if (ext === '.webm') {
    removedWebmBytes += fileSize(filePath);
    removeWebm(filePath);
    removedWebms += 1;
    continue;
  }

  mp4Before += fileSize(filePath);
  const result = optimizeMp4(filePath);
  mp4After += result.after;
  optimizedMp4s += 1;
  if (optimizedMp4s % 25 === 0) {
    console.log(`Optimized ${optimizedMp4s} MP4 videos...`);
  }
}

updateTextReferences();

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

console.log('');
console.log('Asset optimization complete');
console.log(`Images: ${convertedImages} converted, ${mb(imageBefore)} -> ${mb(imageAfter)}`);
console.log(`MP4: ${optimizedMp4s} optimized, ${mb(mp4Before)} -> ${mb(mp4After)}`);
console.log(`WebM: ${removedWebms} removed from deploy, ${mb(removedWebmBytes)} moved to local originals`);
console.log(`Originals stored locally in ${path.relative(root, originalsDir)}`);
