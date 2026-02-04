import type * as osType from 'node:os';

import { jest } from '@jest/globals';

jest.unstable_mockModule('node:os', () => ({
  platform: jest.fn(),
}));

const { getDownloadObject } = await import('./utils');
const os = (await import('node:os')) as typeof osType;

const mockedOs = jest.mocked(os);

const platforms: NodeJS.Platform[] = ['darwin', 'linux', 'win32'];

describe('getDownloadObject', () => {
  describe.each(platforms)('when platform is %p', (platform) => {
    const version = '11.4';

    beforeEach(() => {
      jest.resetAllMocks();
      mockedOs.platform.mockReturnValueOnce(platform);
    });

    it('gets download object', () => {
      expect(getDownloadObject(version)).toMatchSnapshot();
    });
  });
});
