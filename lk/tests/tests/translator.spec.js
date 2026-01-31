const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  // Navigate to the translator application with longer timeout for network issues
  await page.goto("https://www.swifttranslator.com/", {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  // Wait for input field to be ready
  await page
    .getByPlaceholder("Input Your Singlish Text Here.")
    .waitFor({ state: "visible", timeout: 15000 });
  // Add a small delay for any lazy-loaded scripts
  await page.waitForTimeout(1000);
});

// Helper function to wait for translation to complete
async function fillAndWaitForTranslation(page, input) {
  const inputField = page.getByPlaceholder("Input Your Singlish Text Here.");
  const outputDiv = page.locator("div.bg-slate-50").first();

  // Clear any previous content
  await inputField.clear();

  // Fill the input
  await inputField.fill(input);

  // Wait a bit for the translation to start processing
  await page.waitForTimeout(800);

  // Wait for output to have visible content - use a more robust check
  let attempts = 0;
  const maxAttempts = 60; // ~30 seconds with 500ms intervals

  while (attempts < maxAttempts) {
    try {
      const text = await outputDiv.textContent({ timeout: 2000 });
      if (text && text.trim().length > 0) {
        // Double-check the content is stable (wait a moment for final updates)
        await page.waitForTimeout(500);
        return outputDiv;
      }
    } catch (e) {
      // Continue polling on errors
    }
    await page.waitForTimeout(500);
    attempts++;
  }

  // Fallback to original expect if polling times out
  await expect(outputDiv).not.toHaveText("", { timeout: 10000 });
  return outputDiv;
}

// ==========================================
// 1. POSITIVE FUNCTIONAL SCENARIOS
// ==========================================

test("Pos_Fun_0001: Greeting with punctuation", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "karunaakaralaa mata udhavvak karanna puluvandha?",
  );
  await expect(outputDiv).toHaveText("කරුණාකරලා මට උදව්වක් කරන්න පුළුවන්ද?");
});

test("Pos_Fun_0002: Short polite request", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "api daen vaeda karanavaa.",
  );
  await expect(outputDiv).toHaveText("කරුණාකරලා පොඩ්ඩක් ඉන්න.");
});

test("Pos_Fun_0003: Simple daily statement (present)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "mata eeka karanna bae.",
  );
  await expect(outputDiv).toHaveText("මට ඒක කරන්න බැහැ.");
});

test("Pos_Fun_0004: Simple negative sentence", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, "mama heta enavaa.");
  await expect(outputDiv).toHaveText("මම හෙට එනවා.");
});

test("Pos_Fun_0005: Interrogative question", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "vaessa unath api yanna epaeyi",
  );
  await expect(outputDiv).toHaveText("වැස්ස උනත් අපි යන්න එපායි.");
});

test("Pos_Fun_0006: Imperative command", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "vaessa unath api yanna epaeyi.",
  );
  await expect(outputDiv).toHaveText("වැස්ස උනත් අපි යන්න එපායි.");
});

test("Pos_Fun_0007: Pronoun variation (we)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, "issarahata yanna.");
  await expect(outputDiv).toHaveText("ඉස්සරහට යන්න.");
});

test("Pos_Fun_0008: Past tense", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, "suba udhaesanak!");
  await expect(outputDiv).toHaveText("සුබ උදෑසනක්!");
});

test("Pos_Fun_0009: Future tense", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, "oyaalaa enavadha?");
  await expect(outputDiv).toHaveText("ඔයාලා එනවද?");
});

test("Pos_Fun_0010: Compound sentence (two ideas)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "api Kandy valata yamudha.",
  );
  await expect(outputDiv).toHaveText("අපි Kandy වලට යමුද.");
});

test("Pos_Fun_0011: Complex sentence (condition)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "mata Rs. 2500 onee.",
  );
  await expect(outputDiv).toHaveText("මට Rs. 2500 ඕනේ.");
});

test("Pos_Fun_0012: Polite vs informal (polite)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "WiFi connection eka hariyata vaeda karanavaa.",
  );
  await expect(outputDiv).toHaveText("WiFi connection එක හරියට වැඩ කරනවා.");
});

test("Pos_Fun_0013: Informal phrasing (safe)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "machan adha emu dha? hari hari.",
  );
  await expect(outputDiv).toHaveText("මචන් අද එමු ද? හරි හරි.");
});

test("Pos_Fun_0014: Repeated words for emphasis", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, "bala bala enna.");
  await expect(outputDiv).toHaveText("බල බල එන්න.");
});

test("Pos_Fun_0015: Joined vs segmented (proper spacing)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, "mata kanna oonee.");
  await expect(outputDiv).toHaveText("මට කන්න ඕනේ.");
});

test("Pos_Fun_0016: Mixed Singlish + English brand term", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "adha Zoom meeting ekata join venna oonee.",
  );
  await expect(outputDiv).toHaveText("අද Zoom meeting එකට join වෙන්න ඕනේ.");
});

test("Pos_Fun_0017: Places/common English words remain", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "api Negombo yanna hadhannee, traffic nisaa late venna puluvan.",
  );
  await expect(outputDiv).toHaveText(
    "අපි Negombo යන්න හදන්නේ, traffic නිසා late වෙන්න පුලුවන්.",
  );
});

test("Pos_Fun_0018: Abbreviations (ID/NIC/OTP)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "mage ID eka saha NIC eka dhaanna. OTP eka enakam inna.",
  );
  await expect(outputDiv).toHaveText(
    "මගෙ ID එක සහ NIC එක දාන්න. OTP එක එනකම් ඉන්න.",
  );
});

test("Pos_Fun_0019: Currency + time", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "Rs. 4500 adha 8.30 AM vagee pay karanna puluvandha?",
  );
  await expect(outputDiv).toHaveText(
    "Rs. 4500 අද 8.30 AM වගේ pay කරන්න පුලුවන්ද?",
  );
});

test("Pos_Fun_0020: Date formats", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "2/12/2026 dhina api film ekak balanna plan karamu.",
  );
  await expect(outputDiv).toHaveText(
    "2/12/2026 දින අපි film එකක් බලන්න plan කරමු.",
  );
});

test("Pos_Fun_0021: Units of measurement", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "mata 500ml biima bottle ekak thiyenavaa, 2kg bathuth ganna oonee.",
  );
  await expect(outputDiv).toHaveText(
    "මට 500ml බීම bottle එකක් තියෙනවා, 2kg බතුත් ගන්න ඕනේ.",
  );
});

test("Pos_Fun_0022: Multiple spaces (formatting)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "mama   paare   inne.  oyaa   enna.",
  );
  await expect(outputDiv).toHaveText("මම පාරෙ ඉන්නේ. ඔයා එන්න.");
});

test("Pos_Fun_0023: Line breaks (multi-line)", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "mama pansal yanavaa.\\noyaa enavadha maath ekka?",
  );
  await expect(outputDiv).toHaveText("මම පන්සල් යනවා.\\නොයා එනවද මාත් එක්ක?");
});

test("Pos_Fun_0024: Long paragraph (≥300 chars)", async ({ page }) => {
  const input =
    "adha mama office giyaa. ehema giyaath, traffic godak thibuna nisaa api parakku vunaa. passe meeting eka patan gaththa, mata notes tika ganna baeri vunaa. havasa, api vaeda ivara karala gedhara avaa. hetath me vidhiyata yanna baeri veyi kiyala mata hitanavaa.";
  const expected =
    "අද මම office ගියා. එහෙම ගියාත්, traffic ගොඩක් තිබුන නිසා අපි පරක්කු වුනා. පස්සෙ meeting එක පටන් ගත්ත, මට notes ටික ගන්න බැරි වුනා. හවස, අපි වැඩ ඉවර කරල ගෙදර අවා. හෙටත් මෙ විදියට යන්න බැරි වෙයි කියල මට හිටනවා.";
  const outputDiv = await fillAndWaitForTranslation(page, input);
  await expect(outputDiv).toHaveText(expected);
});

// ==========================================
// 2. NEGATIVE FUNCTIONAL SCENARIOS
// ==========================================

test("Neg_Fun_0001: Joined words without spaces cause incorrect segmentation", async ({
  page,
}) => {
  const outputDiv = await fillAndWaitForTranslation(page, "mamagedharayanavaa");
  await expect(outputDiv).toHaveText("මම ගෙදර යනවා");
});

test("Neg_Fun_0002: Common typo may lead to wrong transliteration", async ({
  page,
}) => {
  const outputDiv = await fillAndWaitForTranslation(page, "mata bth onee.");
  await expect(outputDiv).toHaveText("මට බත් ඕනේ.");
});

test("Neg_Fun_0003: Slang with stretched letters may distort output", async ({
  page,
}) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "elaaa machan, supiriii!",
  );
  await expect(outputDiv).toHaveText("එලා මචන්, සුපිරි!");
});

test("Neg_Fun_0004: High English ratio confuses Singlish conversion", async ({
  page,
}) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "please mama offz yanna onee, but traffic.",
  );
  await expect(outputDiv).toHaveText("please මම office යන්න ඕනේ, but traffic.");
});

test("Neg_Fun_0005: Multiple abbreviations produce unexpected conversion", async ({
  page,
}) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "mama ATM eka langa POS eke pay karanavaa.",
  );
  await expect(outputDiv).toHaveText(
    "Please මම ගෙදර යනවා now, because meeting start.මම ATM එක ලඟ POS එකේ pay කරනවා.",
  );
});

test("Neg_Fun_0006: Emoji handling", async ({ page }) => {
  const outputDiv = await fillAndWaitForTranslation(page, "mama happy 🙂 ada!");
  await expect(outputDiv).toHaveText("මම happy 🙂 අද!");
});

test("Neg_Fun_0007: Quotes and mixed punctuation alter sentence formatting", async ({
  page,
}) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    'oyaa \\"hari\\" kiyala kiwwa.',
  );
  await expect(outputDiv).toHaveText('ඔයා \\"හරි\\" කියලා කිව්වා.');
});

test("Neg_Fun_0008: Date format mixed with English causes inconsistent conversion", async ({
  page,
}) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "2026-02-01 wenakan meet wenna.",
  );
  await expect(outputDiv).toHaveText("2026-02-01 වෙන්නකන් meet වෙන්න.");
});

test("Neg_Fun_0009: Very long mixed paragraph causes inaccurate or slow conversion", async ({
  page,
}) => {
  const input =
    "mama adha gedhara inna gaman, sudden vaessa wahala. oyaa kiyapu nisaa api trip eka cancel kala. ehema wunath, mama booking details tika email karala document tika attach karala evannam. passe api aluth date ekak set karamu, ok da? me paragraph eka long input test ekak widihata danna.";
  const expected =
    "දිග input එක Sinhala වලට නිවැරදිව හැරවිය යුතුය (දෝෂ නැතිව).";
  const outputDiv = await fillAndWaitForTranslation(page, input);
  await expect(outputDiv).toHaveText(expected);
});

test("Neg_Fun_0010: Repeated words without punctuation cause spacing problems", async ({
  page,
}) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "hri hri hri mama yannam",
  );
  await expect(outputDiv).toHaveText("හරි හරි හරි මම යන්නම්");
});

// ==========================================
// 3. POSITIVE UI SCENARIOS
// ==========================================

test("Pos_UI_0001: Sinhala output updates automatically while typing (real-time)", async ({
  page,
}) => {
  const outputDiv = await fillAndWaitForTranslation(
    page,
    "mama gedhara yanavaa",
  );
  await expect(outputDiv).toContainText("mama gedha");
});
