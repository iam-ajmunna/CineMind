import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLSITEHUB_SERVERS_DIRECTORY,
  convertToConnections,
  ServerHealthResult
} from './serverChecker';

test('ALLSITEHUB_SERVERS_DIRECTORY contains key BDIX servers including DFlix and CircleFTP', () => {
  const dflix = ALLSITEHUB_SERVERS_DIRECTORY.find((s) => s.id === 'srv-dflix');
  const circleftp = ALLSITEHUB_SERVERS_DIRECTORY.find((s) => s.id === 'srv-circleftp');
  const samonline = ALLSITEHUB_SERVERS_DIRECTORY.find((s) => s.id === 'srv-samonline');

  assert.ok(dflix, 'DFlix server should exist');
  assert.equal(dflix?.url, 'http://dflix.live');
  assert.ok(circleftp, 'CircleFTP server should exist');
  assert.ok(samonline, 'SamOnline server should exist');
  assert.ok(ALLSITEHUB_SERVERS_DIRECTORY.length >= 6);
});

test('convertToConnections only includes confirmed online servers and builds movie items', () => {
  const mockResults: ServerHealthResult[] = [
    {
      serverId: 'srv-dflix',
      name: 'DFlix Live',
      url: 'http://dflix.live',
      status: 'online',
      latencyMs: 14,
      ispPeering: 'WiFi Provider',
      category: 'WiFi ISP',
    },
    {
      serverId: 'srv-circleftp',
      name: 'CircleFTP',
      url: 'http://circleftp.net',
      status: 'offline', // Unreachable on this ISP
      ispPeering: 'Circle Network',
      category: 'Major BDIX',
    },
    {
      serverId: 'srv-samonline',
      name: 'SamOnline',
      url: 'http://movie.samonline.net',
      status: 'online',
      latencyMs: 22,
      ispPeering: 'SamOnline 10Gbps',
      category: 'Major BDIX',
    },
  ];

  const { servers, movies } = convertToConnections(mockResults);

  // Should only have 2 servers (dflix and samonline)
  assert.equal(servers.length, 2);
  const serverIds = servers.map((s) => s.id);
  assert.ok(serverIds.includes('srv-dflix'));
  assert.ok(serverIds.includes('srv-samonline'));
  assert.ok(!serverIds.includes('srv-circleftp'));

  // Should have generated movies with server names
  assert.ok(movies.length > 0);
  assert.ok(movies.some((m) => m.serverName.includes('DFlix')));
});
