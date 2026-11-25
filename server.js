import express from 'express';
import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(dir, 'data');
const db = path.join(dataDir, 'inquiries.json');
const app = express();
app.use(express.json({ limit: '30kb' }));
const hits = new Map(); // simple rate limit: 5 enquiries / 10 min / IP
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const read = async () => { try { return JSON.parse(await fs.readFile(db, 'utf8')); } catch { return []; } };

app.post('/api/contact', async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot for bots
  const ip = req.ip, now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 6e5);
  if (recent.length >= 5) return res.status(429).json({ error: 'Too many enquiries. Please try again later.' });
  hits.set(ip, [...recent, now]);
  const f = k => String(b[k] || '').trim().slice(0, k === 'message' ? 3000 : 200);
  const q = { id: crypto.randomUUID(), at: new Date().toISOString(), name: f('name'), email: f('email'), phone: f('phone'), business: f('business'), pack: f('pack'), quantity: f('quantity'), message: f('message') };
  if (!q.name || !q.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.email))
    return res.status(400).json({ error: 'Please enter your name, a valid email and a message.' });
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(db, JSON.stringify([...(await read()), q], null, 2)); // saved first, so nothing is ever lost
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Could not save your enquiry. Please try again.' }); }
  let emailed = false;
  const { SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  if (SMTP_USER && SMTP_PASS && CONTACT_TO) {
    try {
      await nodemailer.createTransport({ service: 'gmail', auth: { user: SMTP_USER, pass: SMTP_PASS } }).sendMail({
        from: `PurePeel Website <${SMTP_USER}>`, to: CONTACT_TO, replyTo: q.email,
        subject: `New enquiry: ${q.name}${q.business ? ' (' + q.business + ')' : ''}`,
        html: `<h2>New PurePeel enquiry</h2><p><b>Name:</b> ${esc(q.name)}<br><b>Email:</b> ${esc(q.email)}<br><b>Phone:</b> ${esc(q.phone) || '-'}<br><b>Business:</b> ${esc(q.business) || '-'}<br><b>Pack:</b> ${esc(q.pack) || '-'}<br><b>Quantity:</b> ${esc(q.quantity) || '-'}</p><p style="white-space:pre-wrap">${esc(q.message)}</p><p style="color:#888">${q.at}</p>`
      });
      emailed = true;
    } catch (e) { console.error('Email failed:', e.message); }
  }
  res.status(201).json({ ok: true, emailed });
});
app.get('/api/inquiries', async (req, res) => {
  if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) return res.sendStatus(401);
  res.json((await read()).reverse());
});
app.use(express.static(path.join(dir, 'public')));
app.listen(process.env.PORT || 3000, () => console.log('PurePeel running on http://localhost:' + (process.env.PORT || 3000)));
