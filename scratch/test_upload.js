const http = require('http');
const fs = require('fs');
const path = require('path');

async function request(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on('error', reject);
    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

async function runTest() {
  console.log('🔑 1. Logging in...');
  const loginPayload = JSON.stringify({ username: 'Admin', password: 'Pixelpi@2022' });
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginPayload)
    }
  }, loginPayload);

  if (loginRes.status !== 200) {
    throw new Error('Login failed: ' + loginRes.body);
  }

  const { token } = JSON.parse(loginRes.body);
  console.log('✓ Token obtained successfully.');

  console.log('\n📤 2. Uploading test image...');
  const imgPath = path.join(__dirname, '../public/images/logo.jpg');
  const imgBuffer = fs.readFileSync(imgPath);
  const boundary = '----WebKitFormBoundaryTestVerify';
  
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="images"; filename="verify_temp.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  const payload = Buffer.concat([
    Buffer.from(header, 'utf8'),
    imgBuffer,
    Buffer.from(footer, 'utf8')
  ]);

  const uploadRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/admin/gallery/upload',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': payload.length
    }
  }, payload);

  if (uploadRes.status !== 200) {
    throw new Error('Upload failed: ' + uploadRes.body);
  }

  const uploadPayload = JSON.parse(uploadRes.body);
  const uploadedFilename = uploadPayload.data[0].filename;
  console.log('✓ Image uploaded. Filename:', uploadedFilename);

  console.log('\n✏️ 3. Updating image title and description...');
  const updatePayload = JSON.stringify({
    title: 'Aerospace Core Module',
    desc: 'Cutting-edge satellite guidance computer developed by Pixel Pi Technologies.'
  });

  const updateRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/admin/gallery/${encodeURIComponent(uploadedFilename)}`,
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(updatePayload)
    }
  }, updatePayload);

  if (updateRes.status !== 200) {
    throw new Error('Update details failed: ' + updateRes.body);
  }
  console.log('✓ Metadata updated successfully:', updateRes.body);

  console.log('\n🔍 4. Verifying homepage API merges metadata...');
  const publicRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/gallery',
    method: 'GET'
  });

  if (publicRes.status !== 200) {
    throw new Error('Failed to fetch public gallery API');
  }

  const publicData = JSON.parse(publicRes.body);
  const uploadedItem = publicData.data.find(img => img.filename === uploadedFilename);

  if (!uploadedItem) {
    throw new Error('Uploaded image was not returned in public gallery list');
  }

  console.log('✓ Uploaded image found in list.');
  console.log('  Title:', uploadedItem.title);
  console.log('  Desc :', uploadedItem.desc);

  if (uploadedItem.title !== 'Aerospace Core Module' || !uploadedItem.desc.includes('satellite guidance')) {
    throw new Error('Metadata was not correctly saved or merged!');
  }
  console.log('✓ Dynamic metadata matched expected values.');

  console.log('\n🗑️ 5. Deleting test image...');
  const deleteRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/admin/gallery/${encodeURIComponent(uploadedFilename)}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (deleteRes.status !== 200) {
    throw new Error('Delete failed: ' + deleteRes.body);
  }
  console.log('✓ Image deleted from disk and metadata removed.');

  console.log('\n🔍 6. Final verification...');
  const checkRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/gallery',
    method: 'GET'
  });
  const checkData = JSON.parse(checkRes.body);
  const deletedExists = checkData.data.some(img => img.filename === uploadedFilename);
  if (deletedExists) {
    throw new Error('Deleted image is still returned in API!');
  }
  console.log('✓ Verified deleted image is no longer returned.');
  console.log('\n✨ GALLERY METADATA & UPLOAD FLOW FULLY VERIFIED AND CORRECT!');
}

runTest().catch((err) => {
  console.error('\n❌ Verification failed:', err.message);
  process.exit(1);
});
