import { platform } from 'node:os';
import { dirname, join } from 'node:path';
import { chdir } from 'node:process';

import { addPath, getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import {
  cacheFile,
  downloadTool,
  extractTar,
  extractZip,
  find,
} from '@actions/tool-cache';

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

      // Extract the tarball/zipball onto the host runner
      const extract = download.url.endsWith('.zip') ? extractZip : extractTar;
      const toolPath = await extract(downloadPath);

      // Get the binary
      const binaryDirectory = join(toolPath, download.binaryDirectory);
      binaryPath = join(binaryDirectory, download.filename);

      // Configure and build the binary
      // https://love2d.org/wiki/Building_L%C3%96VE#Linux_2
      if (platform() === 'linux') {
        // Install LÖVE dependencies
        await exec('sudo', [
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
        ]);

        chdir(dirname(binaryDirectory));
        await exec('./configure', []);
        await exec('make', []);
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
