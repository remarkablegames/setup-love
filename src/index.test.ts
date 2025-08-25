import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import os from 'os';

import { run } from '.';

jest.mock('@actions/core');
jest.mock('@actions/exec');
jest.mock('@actions/tool-cache');
jest.mock('os');

const mockedCore = jest.mocked(core);
const mockedExec = jest.mocked(exec);
const mockedTc = jest.mocked(tc);
const mockedOs = jest.mocked(os);

beforeEach(() => {
  jest.resetAllMocks();
});

const cliName = 'cli-name';
const cliVersion = '1.2.3';
const pathToZip = 'path/to/zip';
const pathToCLI = 'path/to/cli';

const platforms: NodeJS.Platform[] = ['darwin', 'linux', 'win32'];

describe.each(platforms)('when platform is %p', (os) => {
  beforeEach(() => {
    mockedOs.platform.mockReturnValueOnce(os);

    mockedCore.getInput.mockImplementation((input) => {
      switch (input) {
        case 'name':
          return cliName;
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
    if (!isLinux) {
      mockedTc.extractZip.mockResolvedValueOnce(pathToCLI);
    }

    await run();

    expect(mockedTc.downloadTool).toHaveBeenCalledWith(
      expect.stringContaining(
        `https://github.com/love2d/love/releases/download/${cliVersion}/love-${cliVersion}-`,
      ),
    );

    expect(mockedExec.exec).toHaveBeenCalledWith('mv', [
      expect.stringContaining('love'),
      expect.stringContaining(cliName),
    ]);

    if (isLinux) {
      expect(mockedExec.exec).toHaveBeenCalledWith('chmod', [
        'a+x',
        expect.stringContaining(cliName),
      ]);
    }

    expect(mockedTc.cacheFile).toHaveBeenCalledWith(
      expect.stringContaining(cliName),
      cliName,
      cliName,
      cliVersion,
    );

    expect(mockedCore.addPath).toHaveBeenCalledWith(
      expect.stringContaining(!isLinux ? pathToCLI : pathToZip),
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
