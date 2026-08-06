import type * as osType from 'node:os';

vi.mock('node:os', () => ({
  platform: vi.fn(),
}));

const { getDownloadObject } = await import('./utils');
const os = (await import('node:os')) as typeof osType;

const mockedOs = vi.mocked(os);

const platforms: NodeJS.Platform[] = ['darwin', 'linux', 'win32'];

describe('getDownloadObject', () => {
  describe.each(platforms)('when platform is %s', (platform) => {
    const version = '11.4';

    beforeEach(() => {
      vi.clearAllMocks();
      mockedOs.platform.mockReturnValueOnce(platform);
    });

    it('gets download object', () => {
      expect(getDownloadObject(version)).toMatchSnapshot();
    });
  });
});
