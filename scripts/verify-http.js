import http from 'http';

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      resolve({
        url,
        statusCode: res.statusCode,
        contentType: res.headers['content-type']
      });
    }).on('error', reject);
  });
}

async function verifyAll() {
  console.log('🔍 Verifying Preview Server Endpoints...');
  const res1 = await checkUrl('http://127.0.0.1:3000/');
  const res2 = await checkUrl('http://127.0.0.1:3000/assets/index-atlas.js');
  const res3 = await checkUrl('http://127.0.0.1:3000/assets/index-atlas.css');
  const res4 = await checkUrl('http://127.0.0.1:3000/favicon.svg');

  console.log(`HTML: Status ${res1.statusCode} | Content-Type: ${res1.contentType}`);
  console.log(`JS:   Status ${res2.statusCode} | Content-Type: ${res2.contentType}`);
  console.log(`CSS:  Status ${res3.statusCode} | Content-Type: ${res3.contentType}`);
  console.log(`SVG:  Status ${res4.statusCode} | Content-Type: ${res4.contentType}`);
}

verifyAll().catch(console.error);
