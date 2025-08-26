import { dirname, join } from 'node:path';

import { addPath, getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { cacheFile, downloadTool, extractZip, find } from '@actions/tool-cache';

import { getDownloadObject } from './utils';

const TOOL_NAME = 'love';

export async function run() {
  try {
    // Get the version of the tool
    const version = getInput('version');

    // Find previously cached directory (if applicable)
    let binaryPath = find(TOOL_NAME, version);
    const isCached = Boolean(binaryPath);
    const download = getDownloadObject(version);

    /* istanbul ignore else */
    if (!isCached) {
      // Download the specific version of the tool
      const downloadPath = await downloadTool(download.url);

      // Extract the zipball onto the host runner
      const toolPath = download.url.endsWith('.zip')
        ? await extractZip(downloadPath)
        : downloadPath;

      // Get the binary
      const binaryDirectory = join(toolPath, download.binaryDirectory);
      binaryPath = join(binaryDirectory, download.filename);

      // Rename the binary on Linux
      if (download.url.endsWith('.AppImage')) {
        // AppImages require FUSE to run: https://github.com/AppImage/AppImageKit/wiki/FUSE
        await exec('sudo', ['add-apt-repository', 'universe']);
        await exec('sudo', ['apt', 'install', 'libfuse2t64']);
        binaryPath = join(dirname(toolPath), TOOL_NAME);
        await exec('mv', [toolPath, binaryPath]);
        await exec('chmod', ['+x', binaryPath]);
      }
    }

    // Expose the tool by adding it to the PATH
    addPath(dirname(binaryPath));

    // Cache the tool
    /* istanbul ignore else */
    if (!isCached) {
      await cacheFile(binaryPath, download.filename, TOOL_NAME, version);
    }
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

run();
