import http from 'http';

async function testCDP() {
  // 1. Get targets from Edge CDP endpoint
  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('3000'));
  if (!pageTarget) {
    console.error('❌ Page target not found in Edge CDP');
    return;
  }

  console.log('🔗 Found CDP Page target:', pageTarget.webSocketDebuggerUrl);

  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  let id = 1;
  function sendCommand(method, params = {}) {
    const msgId = id++;
    return new Promise((resolve) => {
      const handler = (event) => {
        const res = JSON.parse(event.data);
        if (res.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  // Evaluate App Ready State & Debug Object
  const evalResult = await sendCommand('Runtime.evaluate', {
    expression: `({
      appReady: document.documentElement.dataset.appReady,
      appState: document.getElementById('app')?.dataset?.appState,
      title: document.title,
      atlasDebug: window.__atlasDebug,
      cardsCount: document.querySelectorAll('.route-card').length,
      headerText: document.querySelector('.app-header')?.textContent?.trim()
    })`,
    returnByValue: true
  });

  console.log('🔍 CDP Evaluation Result:', JSON.stringify(evalResult.result.value, null, 2));

  ws.close();
}

testCDP().catch(console.error);
