import { platform } from 'node:os';

/**
 * Gets download object.
 *
 * @see {@link https://github.com/love2d/love/releases}
 *
 * @param version - LÖVE version
 * @returns - Download object
 */
export function getDownloadObject(version: string) {
  let binaryDirectory = '';
  let filename = 'love';
  let url = `https://github.com/love2d/love/releases/download/${version}/love-${version}-`;

  switch (platform()) {
    case 'darwin':
      binaryDirectory = 'love.app/Contents/MacOS';
      url += 'macos.zip';
      break;

    case 'linux':
      binaryDirectory = 'squashfs-root/bin';
      url += 'x86_64.AppImage';
      break;

    case 'win32':
      binaryDirectory = `love-${version}-win64`;
      filename += '.exe';
      url += 'win64.zip';
      break;
  }

  return {
    binaryDirectory,
    filename,
    url,
  };
}
