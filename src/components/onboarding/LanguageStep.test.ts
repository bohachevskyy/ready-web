import { languageCodes } from './LanguageStep';

describe('LanguageStep language options', () => {
  it('includes Hungarian as a signup native language option', () => {
    expect(languageCodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'hu', flag: '🇭🇺' }),
      ])
    );
  });
});
