import os from 'node:os';
import process from 'node:process';

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

import { run } from '.';

jest.mock('@actions/core');
jest.mock('@actions/exec');
jest.mock('@actions/tool-cache');
jest.mock('node:os');
jest.mock('node:process', () => ({
  chdir: jest.fn(),
}));

const mockedCore = jest.mocked(core);
const mockedExec = jest.mocked(exec);
const mockedTc = jest.mocked(tc);
const mockedOs = jest.mocked(os);
const mockedProcess = jest.mocked(process);

beforeEach(() => {
  jest.resetAllMocks();
});

const cliName = 'love';
const cliVersion = '1.2.3';
const pathToZip = 'path/to/zip';
const pathToCLI = 'path/to/cli';

const platforms: NodeJS.Platform[] = ['darwin', 'linux', 'win32'];

describe.each(platforms)('when platform is %p', (os) => {
  beforeEach(() => {
    mockedOs.platform.mockReturnValue(os);

    mockedCore.getInput.mockImplementation((input) => {
      switch (input) {
        case 'version':
          return cliVersion;
        default:
          throw Error(`Invalid input: ${input}`);
      }
    });
  });

  it('downloads, extracts, and adds CLI to PATH', async () => {
    mockedTc.downloadTool.mockResolvedValueOnce(pathToZip);
    const isLinux = os === 'linux';
    const extract = isLinux ? mockedTc.extractTar : mockedTc.extractZip;
    extract.mockResolvedValueOnce(pathToCLI);

    await run();

    if (isLinux) {
      expect(mockedProcess.chdir).toHaveBeenCalledWith(
        expect.stringContaining(pathToCLI),
      );

      [
        [
          'sudo',
          [
            'apt-get',
            'install',
            'libluajit-5.1-dev',
            'libsdl2-dev',
            'libopenal-dev',
            'libfreetype6-dev',
            'libmodplug-dev',
            'libvorbis-dev',
            'libtheora-dev',
            'libmpg123-dev',
          ],
        ],
        ['./configure', []],
        ['make', []],
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
      expect.stringContaining(pathToCLI),
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
