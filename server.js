import express from 'express';
import cors from 'cors';
import multer from 'multer';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const app = express();
app.use(cors({ origin: true, methods: ['GET', 'POST', 'OPTIONS'] }));
app.get('/', (_req, res) => res.json({ service: 'Edit Cawiye Speech-to-Text API', status: 'online', endpoint: '/api/transcribe' }));
app.get('/health', (_req, res) => res.json({ ok: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if ((file.mimetype || '').startsWith('video/')) return cb(null, true);
    cb(new Error('Fadlan soo geli file muuqaal ah (video).'));
  }
});

function extractAudio(input, output) {
  return new Promise((resolve, reject) => {
    const args = ['-y', '-i', input, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '48k', '-f', 'mp3', output];
    const child = spawn(ffmpegPath, args);
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error('Codka video-ga lagama saari karin. Hubi in video-gu leeyahay cod. ' + stderr.slice(-350))));
  });
}

app.post('/api/transcribe', upload.single('video'), async (req, res) => {
  let tempDir;
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY laguma darin Render Environment.' });
    if (!req.file) return res.status(400).json({ error: 'Video file lama helin.' });

    tempDir = await mkdtemp(join(tmpdir(), 'edit-cawiye-'));
    const videoPath = join(tempDir, 'video-input');
    const audioPath = join(tempDir, 'audio.mp3');
    await writeFile(videoPath, req.file.buffer);
    await extractAudio(videoPath, audioPath);

    const info = await stat(audioPath);
    if (info.size > 24 * 1024 * 1024) {
      return res.status(413).json({ error: 'Codka video-ga wuxuu ka weyn yahay 24 MB. Isticmaal video gaaban ama cabbir hoose.' });
    }

    const audioBuffer = await readFile(audioPath);
    const form = new FormData();
    form.append('file', new Blob([audioBuffer], { type: 'audio/mpeg' }), 'edit-cawiye.mp3');
    form.append('model', 'whisper-large-v3-turbo');
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'segment');
    const language = String(req.body?.language || 'auto');
    if (language !== 'auto') form.append('language', language);

    const upstream = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: form
    });
    const raw = await upstream.text();
    let result;
    try { result = JSON.parse(raw); } catch { result = { error: raw || 'Jawaab aan la fahmi karin.' }; }
    if (!upstream.ok) {
      const message = result?.error?.message || result?.error || `Speech service returned ${upstream.status}`;
      return res.status(502).json({ error: String(message) });
    }

    const segments = Array.isArray(result.segments) ? result.segments
      .filter(s => typeof s.text === 'string' && Number.isFinite(Number(s.start)) && Number.isFinite(Number(s.end)))
      .map(s => ({ text: s.text.trim(), start: Number(s.start), end: Number(s.end) }))
      .filter(s => s.text && s.end > s.start) : [];
    if (!segments.length) return res.status(422).json({ error: 'Cod lama helin ama timestamps lama soo celin.' });
    return res.json({ language: result.language || language, segments });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Cilad aan la garanayn.' });
  } finally {
    if (tempDir) await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Video-gu wuu ka weyn yahay 100 MB.' });
  res.status(400).json({ error: err.message || 'Codsiga lama aqbalin.' });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Edit Cawiye API running on ${port}`));
