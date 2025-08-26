import os from 'node:os';

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

import { run } from '.';

jest.mock('@actions/core');
jest.mock('@actions/exec');
jest.mock('@actions/tool-cache');
jest.mock('node:os');

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
    const isLinux = os === 'linux';
    mockedTc.downloadTool.mockResolvedValueOnce(
      isLinux ? pathToDownload : pathToZip,
    );
    if (!isLinux) {
      mockedTc.extractZip.mockResolvedValueOnce(pathToCLI);
    }

    await run();

    if (isLinux) {
      [
        ['sudo', ['add-apt-repository', 'universe']],
        ['sudo', ['apt', 'install', 'libfuse2t64']],
        ['mv', [pathToDownload, 'path/to/love']],
        ['chmod', ['+x', expect.stringContaining('/love')]],
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
      isLinux ? 'path/to' : expect.stringContaining(pathToCLI),
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
