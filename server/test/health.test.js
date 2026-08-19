import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

describe('Health API & Server Lifecycle', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('GET /api/v1/health returns 200 OK with valid telemetry envelope', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);

    // Verify security headers
    assert.ok(res.headers.get('x-content-type-options'));
    assert.ok(res.headers.get('x-request-id'));

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.status, 'ok');
    assert.equal(json.data.service, 'intube-backend');
    assert.equal(json.data.version, '1.0.0');
    assert.ok(Array.isArray(json.data.providers));
    assert.ok(json.data.providers.includes('youtube'));
    assert.ok(json.data.providers.includes('instagram'));
    assert.ok(typeof json.data.uptime === 'number');
    assert.ok(json.data.memory.heapUsedMB > 0);
  });

  test('Propagates incoming X-Request-ID header in response', async () => {
    const customId = 'custom-test-correlation-id-123';
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      headers: { 'X-Request-ID': customId }
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-request-id'), customId);
  });
});
