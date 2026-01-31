import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.swifttranslator.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });

  await page
    .getByPlaceholder('Input Your Singlish Text Here.')
    .waitFor({ state: 'visible', timeout: 15000 });

  await page.waitForTimeout(1000);
});

// Helper: fill input and wait until output becomes non-empty
async function fillAndWaitForTranslation(page, input) {
  const inputField = page.getByPlaceholder('Input Your Singlish Text Here.');
  const outputDiv = page.locator('div.bg-slate-50').first();

  await inputField.clear();
  await inputField.fill(input);

  await page.waitForTimeout(800);

  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    try {
      const text = await outputDiv.textContent({ timeout: 2000 });
      if (text && text.trim().length > 0) {
        await page.waitForTimeout(500); // stabilize
        return outputDiv;
      }
    } catch {
      // ignore + keep polling
    }
    await page.waitForTimeout(500);
    attempts++;
  }

  await expect(outputDiv).not.toHaveText('', { timeout: 10000 });
  return outputDiv;
}

// ==========================================
// POSITIVE FUNCTIONAL SCENARIOS (Excel)
// ==========================================

test('Pos_Fun_0001: Convert polite request question', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    'karunaakaralaa mata udhavvak karanna puluvandha?'
  );
  await expect(outputDiv).toHaveText('කරුනාකරලා මට උදව්වක් කරන්න පුලුවන්ද?');
});

test('Pos_Fun_0002: Convert simple present tense statement', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'api daen vaeda karanavaa.');
  await expect(outputDiv).toHaveText('අපි ඩැන් වැඩ කරනවා.');
});

test('Pos_Fun_0003: Convert negative capability sentence', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'mata eeka karanna bae.');
  await expect(outputDiv).toHaveText('මට ඒක කරන්න බැ.');
});

test('Pos_Fun_0004: Convert future tense statement', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'mama heta enavaa.');
  await expect(outputDiv).toHaveText('මම හෙට එනවා.');
});

test('Pos_Fun_0005: Convert conditional sentence', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'vaessa unath api yanna epaeyi.');
  await expect(outputDiv).toHaveText('වැස්ස උනත් අපි යන්න එපැයි.');
});

test('Pos_Fun_0006: Convert imperative instruction', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'issarahata yanna.');
  await expect(outputDiv).toHaveText('ඉස්සරහට යන්න.');
});

test('Pos_Fun_0007: Convert greeting phrase', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'suba udhaesanak!');
  await expect(outputDiv).toHaveText('සුබ උදැසනක්!');
});

test('Pos_Fun_0008: Convert plural pronoun question', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'oyaalaa enavadha?');
  await expect(outputDiv).toHaveText('ඔයාලා එනවද?');
});

test('Pos_Fun_0009: Convert sentence with place name', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'api Kandy valata yamudha.');
  await expect(outputDiv).toHaveText('අපි Kandy වලට යමුද.');
});

test('Pos_Fun_0010: Convert sentence with currency value', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'mata Rs. 2500 onee.');
  await expect(outputDiv).toHaveText('මට Rs. 2500 ඔනේ.');
});

test('Pos_Fun_0011: Convert sentence with time format', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'meeting eka 7.30 AM.');
  await expect(outputDiv).toHaveText('meeting එක 7.30 AM.');
});

test('Pos_Fun_0012: Convert sentence with technical terms', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'WiFi connection eka hariyata vaeda karanavaa.');
  await expect(outputDiv).toHaveText('WiFi connection එක හරියට වැඩ කරනවා.');
});

test('Pos_Fun_0013: Convert repeated-word emphasis', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'hari hari hondai.');
  await expect(outputDiv).toHaveText('හරි හරි හොන්ඩෛ.');
});

test('Pos_Fun_0014: Convert multi-line input', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'mama gedhara yanavaa. oyaa enavadha?');
  await expect(outputDiv).toHaveText('මම ගෙදර යනවා. ඔයා එනවද?');
});

test('Pos_Fun_0015: Convert long paragraph input', async ({ page }) => {
  const input =
    'adha udhaesanaye patan gaththa loku vaessa saha sulanga ekka gamata loku prashnayak unaa. godak maargavalata jala piri giya nisaa vaahana yanna amaruu unaa. ehema unath minissunta udhav karanna authorities ikmanin kriyaa karala thiyenavaa kiyala news valin ahanna lebunaa.';
  const expected =
    'අද උදැසනයෙ පටන් ගත්ත ලොකු වැස්ස සහ සුලන්ග එක්ක ගමට ලොකු ප්‍රශ්නයක් උනා. ගොඩක් මාර්ගවලට ජල පිරි ගිය නිසා වාහන යන්න අමරූ උනා. එහෙම උනත් මිනිස්සුන්ට උදව් කරන්න authorities ඉක්මනින් ක්‍රියා කරල තියෙනවා කියල news වලින් අහන්න ලෙබුනා.';

  const outputDiv = await fillAndWaitForTranslation(page, input);
  await expect(outputDiv).toHaveText(expected);
});

test('Pos_Fun_0016: Convert informal request', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'ane eeka dhiyan.');
  await expect(outputDiv).toHaveText('අනෙ ඒක දියන්.');
});

test('Pos_Fun_0017: Convert sentence with abbreviation', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'OTP eka evanna.');
  await expect(outputDiv).toHaveText('OTP එක එවන්න.');
});

// ==========================================
// NEGATIVE FUNCTIONAL SCENARIOS (Excel)
// ==========================================

test('Neg_Fun_0001: Joined words without spaces', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'matapaanonee');
  await expect(outputDiv).toHaveText('මට පාන් ඕනේ.');
});

test('Neg_Fun_0002: Medium-length informal sentence with heavy slang', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    'ado machan adha traffic hari loku bn eka nisaa late venna puluvan kiyala hithenavaa, sorry.'
  );
  await expect(outputDiv).toHaveText(
    'අඩෝ මචං අද traffic හරි ලොකු නිසා late වෙන්න පුළුවන් කියලා හිතෙනවා, sorry.'
  );
});

test('Neg_Fun_0003: Mixed English grammar within Singlish sentence', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    'mama today office gihin passe meeting ekata giyaa'
  );
  await expect(outputDiv).toHaveText('මම අද office ගිහින් පස්සේ meeting එකට ගියා.');
});

test('Neg_Fun_0004: Special characters within input text', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'mama @@## gedhara yanavaa');
  await expect(outputDiv).toHaveText('මම ගෙදර යනවා.');
});

test('Neg_Fun_0005: Conflicting tense indicators in sentence', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'mama heta giyaa');
  await expect(outputDiv).toHaveText('මම හෙට යන්නෙමි.');
});

test('Neg_Fun_0006: Incorrect word order causing wrong meaning', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    'mama gedhara yanavaa passe adha oyaa enne kiyala ahanna hithunaa mokadha kaalaya hari madi.'
  );
  await expect(outputDiv).toHaveText(
    'මම ගෙදර යනවා. පස්සේ අද ඔයා එන්නේ කියලා අහන්න හිතුනා මොකද කාලය හරි මදි.'
  );
});

test('Neg_Fun_0007: Chat-style abbreviated sentence', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'mm gdr ynw passe cll krnnm');
  await expect(outputDiv).toHaveText('මම ගෙදර යනවා පස්සේ කෝල් කරන්නම්.');
});

test('Neg_Fun_0008: Emoji included in input sentence', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, 'mama hari 😊 kiyala hithenavaa');
  await expect(outputDiv).toHaveText('මම හරි කියලා හිතෙනවා.');
});

test('Neg_Fun_0009: Very long malformed input without spaces', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    'mamaadhaudhasanapatangaththavaessasahagamaprashnayakunaa kiyalahithannath baeha.'
  );
  await expect(outputDiv).toHaveText('මම අද උදෑසන පටන් ගත්ත වැස්ස සහ ගම ප්\u200dරශ්නයක් උනා කියලා හිතන්නත් බැහැ.');
});

test('Neg_Fun_0010: Numeric-only input without linguistic content', async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, '202520262027');
  await expect(outputDiv).toHaveText('කිසිදු සිංහල පරිවර්තනයක් නොමැත');
});

// ==========================================
// POSITIVE UI SCENARIOS (Excel)
// ==========================================

test('Pos_UI_0001: Real-time Sinhala output update', async ({ page }) => {
  const inputField = page.getByPlaceholder('Input Your Singlish Text Here.');
  const outputDiv = page.locator('div.bg-slate-50').first();

  await inputField.clear();

  // Type gradually to verify output starts updating before we finish typing
  await inputField.type('mama gedhara yanavaa', { delay: 80 });

  // Behavior-based check: output should not be empty and should be Sinhala-ish (starts showing Sinhala words)
  await expect(outputDiv).not.toHaveText('', { timeout: 15000 });
  await expect(outputDiv).toContainText('ම', { timeout: 15000 });
});
