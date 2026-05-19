import { describe, it, expect } from 'vitest';
import { createNormattivaServer } from '../index.js';

describe('Normattiva MCP Server', () => {
  it('creates server instance', () => {
    const server = createNormattivaServer();
    expect(server).toBeDefined();
  });
});
