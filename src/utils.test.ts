import os from 'os';

import { getDownloadObject } from './utils';

jest.mock('os');
const mockedOs = jest.mocked(os);

const platforms: NodeJS.Platform[] = ['darwin', 'linux', 'win32'];

describe('getDownloadObject', () => {
  describe.each(platforms)('when platform is %p', (os) => {
    const version = '11.4';

    beforeEach(() => {
      jest.resetAllMocks();
      mockedOs.platform.mockReturnValueOnce(os);
    });

    it('gets download object', () => {
      expect(getDownloadObject(version)).toMatchSnapshot();
    });
  });
});
