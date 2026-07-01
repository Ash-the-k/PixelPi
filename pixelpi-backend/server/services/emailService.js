'use strict';

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');
const LAYOUT_PATH = path.join(TEMPLATES_DIR, '_layout.html');

// In-memory cache — cleared only on server restart.
// To force a reload during development, restart the process.
const fileCache = {};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSPORTER
// ─────────────────────────────────────────────────────────────────────────────

let transporter = null;

function initTransporter() {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });

    transporter.verify((error) => {
      if (error) {
        console.error('✗ Email configuration error:', error.message);
      } else {
        console.log('✓ Email server is ready to send messages');
      }
    });
  } catch (err) {
    console.error('✗ Failed to create email transporter:', err.message);
    transporter = null;
  }
}

initTransporter();

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE RENDERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads a file from disk and caches the result by absolute path.
 */
function loadFile(absolutePath) {
  if (!fileCache[absolutePath]) {
    fileCache[absolutePath] = fs.readFileSync(absolutePath, 'utf8');
  }
  return fileCache[absolutePath];
}

/**
 * Replaces all {{VARIABLE_NAME}} placeholders in `html` with values from `data`.
 * Keys must be word characters only (A-Z, a-z, 0-9, underscore).
 * Missing or null values render as an empty string — never throws.
 */
function interpolate(html, data) {
  return html.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    const value = data[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

/**
 * Renders a complete email by:
 *  1. Loading the shared _layout.html
 *  2. Loading the body partial (relative to server/templates/emails/)
 *  3. Interpolating the partial with `data`
 *  4. Injecting the rendered partial into {{BODY_CONTENT}} in the layout
 *  5. Interpolating the composed result with `data` (resolves layout-level variables)
 *
 * Using a replacer function for step 4 prevents '$' signs in the body partial
 * from being misinterpreted as RegExp backreferences by String.replace.
 *
 * @param {string} bodyPartialRelativePath - e.g. 'contact/user-body.html'
 * @param {object} data                    - SCREAMING_SNAKE_CASE variable map
 * @returns {string} fully rendered HTML string
 */
function renderEmail(bodyPartialRelativePath, data) {
  const layout = loadFile(LAYOUT_PATH);
  const partialPath = path.join(TEMPLATES_DIR, bodyPartialRelativePath);
  const partial = loadFile(partialPath);

  const renderedBody = interpolate(partial, data);
  const composed = layout.replace('{{BODY_CONTENT}}', () => renderedBody);
  return interpolate(composed, data);
}

// ─────────────────────────────────────────────────────────────────────────────
// SENDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a pre-rendered HTML email.
 * Never throws — always resolves with { success, error? }.
 *
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function sendMail({ to, subject, html }) {
  if (!transporter) {
    return { success: false, error: 'Email transporter not configured' };
  }
  if (!to) {
    return { success: false, error: 'No recipient address provided' };
  }

  try {
    await transporter.sendMail({
      from: `"Pixel Pi Technologies" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    return { success: true };
  } catch (error) {
    console.error(`✗ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Renders a body partial into the shared layout, then sends the result.
 * Never throws — always resolves with { success, error? }.
 *
 * @param {object}  options
 * @param {string}  options.to           - recipient address
 * @param {string}  options.subject      - email subject line
 * @param {string}  options.bodyPartial  - relative path, e.g. 'contact/user-body.html'
 * @param {object}  options.data         - SCREAMING_SNAKE_CASE variable map
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function sendTemplatedMail({ to, subject, bodyPartial, data }) {
  try {
    const html = renderEmail(bodyPartial, data);
    return await sendMail({ to, subject, html });
  } catch (error) {
    console.error(`✗ Failed to render/send email (${bodyPartial}):`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendMail, sendTemplatedMail };