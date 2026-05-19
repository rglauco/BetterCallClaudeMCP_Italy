import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'mcp-servers/*/vitest.config.ts',
  'mcp-servers-http/vitest.config.ts',
]);
