import type * as osType from 'node:os';

import type * as coreType from '@actions/core';
import type * as execType from '@actions/exec';
import type * as tcType from '@actions/tool-cache';

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  addPath: vi.fn(),
  setFailed: vi.fn(),
}));

vi.mock('@actions/exec', () => ({
  exec: vi.fn(),
}));

vi.mock('@actions/tool-cache', () => ({
  downloadTool: vi.fn(),
  extractZip: vi.fn(),
  cacheFile: vi.fn(),
  find: vi.fn(),
}));

vi.mock('node:os', () => ({
  platform: vi.fn(),
}));

const { run } = await import('.');
const core = (await import('@actions/core')) as typeof coreType;
const exec = (await import('@actions/exec')) as typeof execType;
const tc = (await import('@actions/tool-cache')) as typeof tcType;
const os = (await import('node:os')) as typeof osType;

const mockedCore = vi.mocked(core);
const mockedExec = vi.mocked(exec);
const mockedTc = vi.mocked(tc);
const mockedOs = vi.mocked(os);

beforeEach(() => {
  vi.clearAllMocks();
});

const cliName = 'love';
const cliVersion = '1.2.3';
const pathToZip = 'path/to/zip';
const pathToCLI = 'path/to/cli';
const pathToDownload = 'path/to/download';

const platforms: NodeJS.Platform[] = ['darwin', 'linux', 'win32'];

describe.each(platforms)('when platform is %s', (platform) => {
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

    vi.spyOn(process, 'chdir').mockImplementation(() => {
      // no-op
    });
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
