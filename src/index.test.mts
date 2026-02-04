import type * as osType from 'node:os';

import type * as coreType from '@actions/core';
import type * as execType from '@actions/exec';
import type * as tcType from '@actions/tool-cache';
import { jest } from '@jest/globals';

jest.unstable_mockModule('@actions/core', () => ({
  getInput: jest.fn(),
  addPath: jest.fn(),
  setFailed: jest.fn(),
}));

jest.unstable_mockModule('@actions/exec', () => ({
  exec: jest.fn(),
}));

jest.unstable_mockModule('@actions/tool-cache', () => ({
  downloadTool: jest.fn(),
  extractZip: jest.fn(),
  cacheFile: jest.fn(),
  find: jest.fn(),
}));

jest.unstable_mockModule('node:os', () => ({
  platform: jest.fn(),
}));

const { run } = await import('.');
const core = (await import('@actions/core')) as typeof coreType;
const exec = (await import('@actions/exec')) as typeof execType;
const tc = (await import('@actions/tool-cache')) as typeof tcType;
const os = (await import('node:os')) as typeof osType;

const mockedCore = jest.mocked(core);
const mockedExec = jest.mocked(exec);
const mockedTc = jest.mocked(tc);
const mockedOs = jest.mocked(os);

beforeEach(() => {
  jest.resetAllMocks();
});

const cliName = 'love';
const cliVersion = '1.2.3';
const pathToZip = 'path/to/zip';
const pathToCLI = 'path/to/cli';
const pathToDownload = 'path/to/download';

const platforms: NodeJS.Platform[] = ['darwin', 'linux', 'win32'];

describe.each(platforms)('when platform is %p', (platform) => {
  beforeEach(() => {
    mockedOs.platform.mockReturnValue(platform);

    mockedCore.getInput.mockImplementation((input) => {
      switch (input) {
        case 'version':
          return cliVersion;
        default:
          throw Error(`Invalid input: ${input}`);
      }
    });

    jest.spyOn(process, 'chdir');
  });

  it('downloads, extracts, and adds CLI to PATH', async () => {
    const isLinux = platform === 'linux';
    mockedTc.downloadTool.mockResolvedValueOnce(
      isLinux ? pathToDownload : pathToZip,
    );
    if (!isLinux) {
      mockedTc.extractZip.mockResolvedValueOnce(pathToCLI);
    }

    await run();

    if (isLinux) {
      expect(process.chdir).toHaveBeenCalledWith('path/to');
      [
        ['chmod', ['+x', pathToDownload]],
        [pathToDownload, ['--appimage-extract']],
      ].forEach((params) =>
        expect(mockedExec.exec).toHaveBeenCalledWith(...params),
      );
    }

    expect(mockedTc.downloadTool).toHaveBeenCalledWith(
      expect.stringContaining(
        `https://github.com/love2d/love/releases/download/${cliVersion}/love-${cliVersion}-`,
      ),
    );

    expect(mockedTc.cacheFile).toHaveBeenCalledWith(
      expect.stringContaining(cliName),
      expect.stringContaining(cliName),
      cliName,
      cliVersion,
    );

    expect(mockedCore.addPath).toHaveBeenCalledWith(
      isLinux
        ? 'path/to/squashfs-root/bin'
        : expect.stringContaining(pathToCLI),
    );
  });
});

describe('error', () => {
  it('throws error', async () => {
    const message = 'error';
    mockedCore.getInput.mockImplementationOnce(() => {
      throw new Error(message);
    });
    await run();
    expect(mockedCore.setFailed).toHaveBeenCalledWith(message);
  });
});
