import { addPath, getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { cacheFile, downloadTool, extractZip, find } from '@actions/tool-cache';
import { dirname, join } from 'path';

import { getDownloadObject } from './utils';

export async function run() {
  try {
    // Get the name and version of the tool
    const cliName = getInput('name');
    const cliVersion = getInput('version');
    const toolName = cliName;

    // Find previously cached directory (if applicable)
    let binaryPath = find(toolName, cliVersion);
    const isCached = Boolean(binaryPath);

    /* istanbul ignore else */
    if (!isCached) {
      // Download the specific version of the tool
      const download = getDownloadObject(cliVersion);
      const downloadPath = await downloadTool(download.url);

      // Extract the zipball onto the host runner
      const toolPath = download.url.endsWith('.zip')
        ? await extractZip(downloadPath)
        : downloadPath;

      // Get the binary
      const binaryDirectory = join(toolPath, download.binaryDirectory);
      binaryPath = join(binaryDirectory, `${cliName}${download.extension}`);

      // Rename the binary
      await exec('mv', [join(binaryDirectory, download.filename), binaryPath]);

      // Make AppImage executable
      if (download.filename.endsWith('.AppImage')) {
        await exec('chmod', ['a+x', binaryPath]);
      }
    }

    // Expose the tool by adding it to the PATH
    addPath(dirname(binaryPath));

    // Cache the tool
    /* istanbul ignore else */
    if (!isCached) {
      await cacheFile(binaryPath, cliName, toolName, cliVersion);
    }
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

run();
