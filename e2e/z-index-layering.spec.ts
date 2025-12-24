import { test, expect } from '@playwright/test';

/**
 * Z-Index Layering Visual Regression Tests
 * =========================================
 * 
 * These tests verify that z-index layering works correctly across the application.
 * They catch bugs like dropdowns appearing behind floating windows.
 * 
 * Run: pnpm test:e2e
 * Update snapshots: pnpm test:e2e --update-snapshots
 */

test.describe('Z-Index Layering', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('Mode dropdown appears above page content', async ({ page }) => {
    // Click the Mode button in the header
    const modeButton = page.getByRole('button', { name: /mode/i });
    
    if (await modeButton.isVisible()) {
      await modeButton.click();
      
      // Wait for dropdown to appear
      await page.waitForTimeout(300);
      
      // Take a screenshot for visual comparison
      await expect(page).toHaveScreenshot('mode-dropdown-open.png', {
        maxDiffPixels: 100,
      });
      
      // Verify the dropdown is visible
      const dropdown = page.locator('[role="menu"], [data-state="open"]').first();
      if (await dropdown.isVisible()) {
        // Get the z-index of the dropdown
        const zIndex = await dropdown.evaluate((el) => {
          return window.getComputedStyle(el).zIndex;
        });
        
        // Dropdown should have a high z-index
        expect(parseInt(zIndex) || 0).toBeGreaterThan(0);
      }
    }
  });

  test('Floating chat window opens correctly', async ({ page }) => {
    // Click Mode button and select Chat to open a floating window
    const modeButton = page.getByRole('button', { name: /mode/i });
    
    if (await modeButton.isVisible()) {
      await modeButton.click();
      await page.waitForTimeout(200);
      
      // Look for Chat option in the dropdown
      const chatOption = page.getByText(/^chat$/i, { exact: false });
      if (await chatOption.isVisible()) {
        await chatOption.click();
        await page.waitForTimeout(500);
        
        // Take a screenshot of the floating window
        await expect(page).toHaveScreenshot('floating-chat-window.png', {
          maxDiffPixels: 200,
        });
      }
    }
  });

  test('Quick Presets dropdown appears above floating window', async ({ page }) => {
    // First, open a floating chat window
    const modeButton = page.getByRole('button', { name: /mode/i });
    
    if (await modeButton.isVisible()) {
      await modeButton.click();
      await page.waitForTimeout(200);
      
      const chatOption = page.getByText(/^chat$/i, { exact: false });
      if (await chatOption.isVisible()) {
        await chatOption.click();
        await page.waitForTimeout(500);
        
        // Now look for the Presets button in the floating window
        const presetsButton = page.getByRole('button', { name: /presets/i }).first();
        
        if (await presetsButton.isVisible()) {
          await presetsButton.click();
          await page.waitForTimeout(300);
          
          // Take a screenshot showing the presets panel
          await expect(page).toHaveScreenshot('presets-panel-open.png', {
            maxDiffPixels: 200,
          });
          
          // Look for the "..." menu button in Quick Presets
          const moreButton = page.locator('button:has-text("...")').first();
          
          if (await moreButton.isVisible()) {
            await moreButton.click();
            await page.waitForTimeout(300);
            
            // Take a screenshot showing the dropdown menu
            await expect(page).toHaveScreenshot('quick-presets-dropdown.png', {
              maxDiffPixels: 200,
            });
            
            // Verify dropdown is visible and has correct z-index
            const dropdown = page.locator('[role="menu"]').first();
            if (await dropdown.isVisible()) {
              const boundingBox = await dropdown.boundingBox();
              expect(boundingBox).not.toBeNull();
              
              // Dropdown should be visible (not hidden behind other elements)
              expect(boundingBox!.width).toBeGreaterThan(0);
              expect(boundingBox!.height).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });

  test('Models dropdown appears correctly in floating window', async ({ page }) => {
    // Open a floating chat window
    const modeButton = page.getByRole('button', { name: /mode/i });
    
    if (await modeButton.isVisible()) {
      await modeButton.click();
      await page.waitForTimeout(200);
      
      const chatOption = page.getByText(/^chat$/i, { exact: false });
      if (await chatOption.isVisible()) {
        await chatOption.click();
        await page.waitForTimeout(500);
        
        // Look for the Models button
        const modelsButton = page.getByRole('button', { name: /model/i }).first();
        
        if (await modelsButton.isVisible()) {
          await modelsButton.click();
          await page.waitForTimeout(300);
          
          // Take a screenshot of the models panel
          await expect(page).toHaveScreenshot('models-panel-open.png', {
            maxDiffPixels: 200,
          });
        }
      }
    }
  });

  test('Multiple floating windows layer correctly', async ({ page }) => {
    // Open first chat window
    const modeButton = page.getByRole('button', { name: /mode/i });
    
    if (await modeButton.isVisible()) {
      // Open first window
      await modeButton.click();
      await page.waitForTimeout(200);
      
      let chatOption = page.getByText(/^chat$/i).first();
      if (await chatOption.isVisible()) {
        await chatOption.click();
        await page.waitForTimeout(500);
        
        // Close the dropdown by clicking elsewhere first
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
        
        // Take a screenshot showing the chat window
        await expect(page).toHaveScreenshot('multiple-windows.png', {
          maxDiffPixels: 300,
        });
      }
    }
  });

  test('Dialog modals appear above all other content', async ({ page }) => {
    // Open a floating chat window
    const modeButton = page.getByRole('button', { name: /mode/i });
    
    if (await modeButton.isVisible()) {
      await modeButton.click();
      await page.waitForTimeout(200);
      
      const chatOption = page.getByText(/^chat$/i, { exact: false });
      if (await chatOption.isVisible()) {
        await chatOption.click();
        await page.waitForTimeout(500);
        
        // Look for Settings button to open a modal
        const settingsButton = page.locator('button[title*="Settings"], button:has(svg.lucide-settings)').first();
        
        if (await settingsButton.isVisible()) {
          await settingsButton.click();
          await page.waitForTimeout(300);
          
          // Look for "Categories Setting" or similar option that opens a modal
          const categoriesOption = page.getByText(/categories/i).first();
          
          if (await categoriesOption.isVisible()) {
            await categoriesOption.click();
            await page.waitForTimeout(300);
            
            // Take a screenshot showing the modal
            await expect(page).toHaveScreenshot('categories-modal.png', {
              maxDiffPixels: 200,
            });
            
            // Verify modal is visible
            const modal = page.locator('[role="dialog"], .fixed.inset-0').first();
            if (await modal.isVisible()) {
              const zIndex = await modal.evaluate((el) => {
                return window.getComputedStyle(el).zIndex;
              });
              
              // Modal should have a high z-index (400+)
              expect(parseInt(zIndex) || 0).toBeGreaterThanOrEqual(400);
            }
          }
        }
      }
    }
  });
});

test.describe('Hamburger Menu Z-Index', () => {
  
  test('Hamburger menu appears above floating chat windows on desktop', async ({ page }) => {
    await page.goto('/empty');
    await page.waitForLoadState('networkidle');
    
    // First, open a chat window
    const modeButton = page.getByRole('button', { name: /mode/i });
    
    if (await modeButton.isVisible()) {
      await modeButton.click();
      await page.waitForTimeout(200);
      
      // Click to add a chat window
      const chatOption = page.getByText(/^chat$/i, { exact: false });
      if (await chatOption.isVisible()) {
        await chatOption.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Now open the hamburger menu
    const hamburgerButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') }).first();
    
    if (await hamburgerButton.isVisible()) {
      await hamburgerButton.click();
      await page.waitForTimeout(300);
      
      // Take a screenshot - hamburger menu should be above the chat window
      await expect(page).toHaveScreenshot('hamburger-menu-above-chat-window.png', {
        maxDiffPixels: 200,
      });
      
      // Verify the sidebar menu has correct z-index (275-280 range, above FLOATING 200)
      const sidebarMenu = page.locator('.fixed.left-0.top-0.bottom-0').first();
      if (await sidebarMenu.isVisible()) {
        const zIndex = await sidebarMenu.evaluate((el) => {
          return window.getComputedStyle(el).zIndex;
        });
        
        // Sidebar menu should have z-index >= 275 (SIDEBAR_BACKDROP/SIDEBAR_MENU)
        expect(parseInt(zIndex) || 0).toBeGreaterThanOrEqual(275);
      }
      
      // Verify the backdrop is also above floating windows
      const backdrop = page.locator('.fixed.inset-0.bg-black\\/50').first();
      if (await backdrop.isVisible()) {
        const backdropZIndex = await backdrop.evaluate((el) => {
          return window.getComputedStyle(el).zIndex;
        });
        
        // Backdrop should have z-index >= 275
        expect(parseInt(backdropZIndex) || 0).toBeGreaterThanOrEqual(275);
      }
    }
  });

  test('Hamburger menu appears above floating chat windows on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/empty');
    await page.waitForLoadState('networkidle');
    
    // First, open a chat window
    const modeButton = page.getByRole('button', { name: /mode/i });
    
    if (await modeButton.isVisible()) {
      await modeButton.click();
      await page.waitForTimeout(200);
      
      // Click to add a chat window
      const chatOption = page.getByText(/^chat$/i, { exact: false });
      if (await chatOption.isVisible()) {
        await chatOption.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Now open the hamburger menu
    const hamburgerButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') }).first();
    
    if (await hamburgerButton.isVisible()) {
      await hamburgerButton.click();
      await page.waitForTimeout(300);
      
      // Take a screenshot - hamburger menu should be above the chat window on mobile
      await expect(page).toHaveScreenshot('mobile-hamburger-menu-above-chat-window.png', {
        maxDiffPixels: 200,
      });
      
      // Verify the sidebar menu has correct z-index
      const sidebarMenu = page.locator('.fixed.left-0.top-0.bottom-0').first();
      if (await sidebarMenu.isVisible()) {
        const zIndex = await sidebarMenu.evaluate((el) => {
          return window.getComputedStyle(el).zIndex;
        });
        
        // Sidebar menu should have z-index >= 275
        expect(parseInt(zIndex) || 0).toBeGreaterThanOrEqual(275);
      }
    }
  });
});

test.describe('Mobile Z-Index Layering', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('Dropdowns work correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open a chat window
    const modeButton = page.getByRole('button', { name: /mode/i });
    
    if (await modeButton.isVisible()) {
      await modeButton.click();
      await page.waitForTimeout(200);
      
      const chatOption = page.getByText(/^chat$/i, { exact: false });
      if (await chatOption.isVisible()) {
        await chatOption.click();
        await page.waitForTimeout(500);
        
        // Take a screenshot of mobile view
        await expect(page).toHaveScreenshot('mobile-chat-window.png', {
          maxDiffPixels: 200,
        });
        
        // Test that Presets button works
        const presetsButton = page.getByRole('button', { name: /presets/i }).first();
        
        if (await presetsButton.isVisible()) {
          await presetsButton.click();
          await page.waitForTimeout(300);
          
          await expect(page).toHaveScreenshot('mobile-presets-panel.png', {
            maxDiffPixels: 200,
          });
        }
      }
    }
  });
});
