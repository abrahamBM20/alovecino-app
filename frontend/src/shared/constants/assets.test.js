import { ASSETS } from './assets';

describe('ASSETS', () => {
  it('empaqueta logos como assets locales para builds QA', () => {
    Object.values(ASSETS).forEach((asset) => {
      expect(asset).toBeDefined();
      expect(typeof asset).not.toBe('string');

      if (asset && typeof asset === 'object' && 'uri' in asset) {
        expect(asset.uri).not.toMatch(/^https?:\/\//);
        expect(asset.uri).not.toContain('figma.com');
      }
    });
  });
});
