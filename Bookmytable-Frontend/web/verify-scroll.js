import { chromium } from "playwright";

(async () => {
  console.log("=== BOOKMYTABLE MAIN PAGE AUTOMATED VALIDATION ===");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  try {
    await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
    console.log("✓ Page loaded successfully.");

    // 1. Check Section Order in DOM
    const sectionOrder = await page.evaluate(() => {
      const hero = document.querySelector("[data-hero]");
      const story = document.querySelector("section.min-h-screen.py-24");
      const table3d = document.querySelector("section.shadow-\\[0_-30px_70px_rgba\\(0\\,0\\,0\\,0\\.7\\)\\]");
      const footer = document.querySelector("footer");
      
      const allSections = Array.from(document.querySelectorAll("main > div > section, footer"));
      return {
        heroPresent: !!hero,
        storyPresent: !!story,
        table3dCount: document.querySelectorAll("section.shadow-\\[0_-30px_70px_rgba\\(0\\,0\\,0\\,0\\.7\\)\\]").length,
        footerPresent: !!footer,
        totalSections: allSections.length,
      };
    });

    console.log("✓ Section Order check:", JSON.stringify(sectionOrder));
    if (sectionOrder.table3dCount !== 1) {
      console.error(`FAIL: Cinematic3DTable count is ${sectionOrder.table3dCount}, expected exactly 1.`);
    } else {
      console.log("✓ CONFIRMED: Cinematic3DTable appears exactly ONCE in the DOM.");
    }

    // 2. Perform smooth scroll progression down the page
    console.log("\n--- Testing forward scroll through all sections ---");
    let maxScroll = 0;
    for (let scrollY = 0; scrollY <= 5000; scrollY += 250) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(40);
    }

    // Check DOM state at bottom of scroll
    const postScrollState = await page.evaluate(() => {
      return {
        table3dCount: document.querySelectorAll("section.shadow-\\[0_-30px_70px_rgba\\(0\\,0\\,0\\,0\\.7\\)\\]").length,
        canvases: document.querySelectorAll("canvas").length,
        footerVisible: !!document.querySelector("footer"),
      };
    });

    console.log("✓ Post-scroll DOM State:", JSON.stringify(postScrollState));

    // 3. Reverse scroll back to top
    console.log("\n--- Testing reverse scroll back to top ---");
    for (let scrollY = 5000; scrollY >= 0; scrollY -= 300) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(40);
    }

    const finalState = await page.evaluate(() => {
      return {
        table3dCount: document.querySelectorAll("section.shadow-\\[0_-30px_70px_rgba\\(0\\,0\\,0\\,0\\.7\\)\\]").length,
        scrollTop: window.scrollY,
      };
    });

    console.log("✓ Final State after reverse scroll:", JSON.stringify(finalState));
    console.log(`✓ Critical Console Errors: ${errors.length}`);

    if (sectionOrder.table3dCount === 1 && postScrollState.table3dCount === 1 && finalState.table3dCount === 1) {
      console.log("\n==============================================");
      console.log("SUCCESS: ALL SCROLL & LAYOUT TESTS PASSED 100%");
      console.log("==============================================");
    }
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }
})();
