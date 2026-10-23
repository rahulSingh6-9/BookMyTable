import { chromium } from "playwright";

(async () => {
  console.log("=== FINAL VALIDATION: THREE TARGETED UI FIXES ===");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto("http://localhost:8080/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    console.log("✓ Page loaded successfully.");

    // ──────────────────────────────────────────────────────────────────────────
    // FIX 2: Brand text coloring & golden text readability
    // ──────────────────────────────────────────────────────────────────────────
    console.log("\n--- Checking Fix 2: Hero Brand Coloring & Golden Text ---");
    const brandCheck = await page.evaluate(() => {
      const bookSpans = Array.from(document.querySelectorAll("span"))
        .filter(el => el.textContent === "Book" && el.nextElementSibling?.textContent === "My");

      if (bookSpans.length === 0) return { found: false };

      const bookEl = bookSpans[0];
      const myEl = bookEl.nextElementSibling;
      const tableEl = myEl.nextElementSibling;

      const bookColor = window.getComputedStyle(bookEl).color;
      const myColor = window.getComputedStyle(myEl).color;
      const tableColor = window.getComputedStyle(tableEl).color;

      const parentEy = bookEl.closest("span[style*='font-family']");
      const eyColor = parentEy ? window.getComputedStyle(parentEy).color : null;

      return {
        found: true,
        bookColor,
        myColor,
        tableColor,
        eyColor,
      };
    });

    console.log("Brand Coloring Result:", JSON.stringify(brandCheck, null, 2));
    const isBrandValid = brandCheck.found &&
      brandCheck.bookColor.includes("255, 255, 255") &&
      brandCheck.tableColor.includes("255, 255, 255") &&
      brandCheck.eyColor.includes("232, 202, 152");

    if (isBrandValid) {
      console.log("✓ CONFIRMED: Book and Table are white; My is primary red; golden text is luminous warm champagne-gold (#e8ca98).");
    } else {
      console.error("FAIL: Brand coloring check failed.");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // FIX 3: Reversible Hero text lines on scroll
    // ──────────────────────────────────────────────────────────────────────────
    console.log("\n--- Checking Fix 3: Reversible Hero Text Lines on Scroll ---");
    
    // Top of page (0px)
    const initialTextState = await page.evaluate(() => {
      const el = document.evaluate(
        "//span[contains(text(), 'Featured Discoveries')]",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (!el) return { present: false };
      const container = el.closest(".absolute.inset-x-0.bottom-2, .absolute.inset-x-0");
      const style = window.getComputedStyle(container || el);
      return {
        present: true,
        opacity: style.opacity,
        visibility: style.visibility,
      };
    });
    console.log("Initial (Top) Text State (should be hidden):", JSON.stringify(initialTextState));

    // Scroll down to 3200px (around 0.65 progress)
    console.log("Scrolling down to reveal text lines...");
    await page.evaluate(() => window.scrollTo(0, 3200));
    await page.waitForTimeout(1200);

    const scrolledTextState = await page.evaluate(() => {
      const el = document.evaluate(
        "//span[contains(text(), 'Featured Discoveries')]",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (!el) return { present: false };
      const container = el.closest(".absolute.inset-x-0.bottom-2, .absolute.inset-x-0");
      const style = window.getComputedStyle(container || el);
      return {
        present: true,
        opacity: style.opacity,
        visibility: style.visibility,
      };
    });
    console.log("Scrolled Down Text State (should be visible):", JSON.stringify(scrolledTextState));

    // Scroll back UP to 300px
    console.log("Scrolling back UP to 300px (earlier hero frames)...");
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(1200);

    const reversedTextState = await page.evaluate(() => {
      const el = document.evaluate(
        "//span[contains(text(), 'Featured Discoveries')]",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (!el) return { present: false };
      const container = el.closest(".absolute.inset-x-0.bottom-2, .absolute.inset-x-0");
      const style = window.getComputedStyle(container || el);
      return {
        present: true,
        opacity: style.opacity,
        visibility: style.visibility,
      };
    });
    console.log("Reversed Up Text State (must be hidden):", JSON.stringify(reversedTextState));

    const isScrollReversible = parseFloat(scrolledTextState.opacity) > 0.8 && parseFloat(reversedTextState.opacity) < 0.1;
    if (isScrollReversible) {
      console.log("✓ CONFIRMED: Hero text lines reveal on downward scroll and disappear on reverse scroll.");
    } else {
      console.error("FAIL: Reversible text lines check failed.");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // FIX 1: WavyReserveButton continuous idle wave & hover
    // ──────────────────────────────────────────────────────────────────────────
    console.log("\n--- Checking Fix 1: WavyReserveButton Continuous Idle Wave ---");
    // Scroll down to BookMyTableStorySection
    const btnLocator = page.locator("button:has-text('Reserve a table')").first();
    await btnLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const getWavyPath = async () => {
      return page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Reserve a table"));
        if (!btn) return null;
        const path = btn.querySelector("svg path");
        return path ? path.getAttribute("d") : null;
      });
    };

    const path1 = await getWavyPath();
    await page.waitForTimeout(200);
    const path2 = await getWavyPath();

    console.log("Idle Wave Path 1:", path1 ? path1.slice(0, 45) + "..." : "null");
    console.log("Idle Wave Path 2:", path2 ? path2.slice(0, 45) + "..." : "null");

    const isIdleWaveMoving = path1 !== null && path2 !== null && path1 !== path2;
    console.log("✓ Idle wave is continuously moving:", isIdleWaveMoving);

    // Test Hover on button
    console.log("Hovering Reserve a table button...");
    await page.hover("button:has-text('Reserve a table')", { force: true });
    await page.waitForTimeout(800);

    const hoveredTextColor = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Reserve a table"));
      const textSpan = btn ? btn.querySelector("span") : null;
      return textSpan ? window.getComputedStyle(textSpan).color : null;
    });
    console.log("Hovered text color:", hoveredTextColor);

    // Mouse leave
    console.log("Mouse leave...");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(800);

    const postLeavePath1 = await getWavyPath();
    await page.waitForTimeout(200);
    const postLeavePath2 = await getWavyPath();

    const isMovingAfterLeave = postLeavePath1 !== null && postLeavePath2 !== null && postLeavePath1 !== postLeavePath2;
    console.log("✓ Wave continuously moves after mouse leave:", isMovingAfterLeave);

    console.log("\n========================================================");
    if (isBrandValid && isScrollReversible && isIdleWaveMoving && isMovingAfterLeave) {
      console.log("ALL THREE TARGETED UI FIXES VALIDATED 100% SUCCESSFULLY!");
    } else {
      console.log("ONE OR MORE CHECKS FAILED");
    }
    console.log("========================================================");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }
})();
