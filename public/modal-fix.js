/**
 * Emergency Modal Close Utility
 * 
 * Jika modal masih stuck, gunakan script ini di browser console
 * atau jalankan dari developer tools untuk memaksa menutup modal
 */

// Enhanced function untuk memaksa menutup semua modal Chakra UI
function forceCloseAllModals() {
  console.log('🚨 ENHANCED MODAL FORCE CLOSE - Starting...');
  
  let cleanupCount = 0;
  
  try {
    // Metode 1: Click semua close buttons yang visible
    const closeButtons = document.querySelectorAll('[aria-label*="close" i], [aria-label*="tutup" i], .chakra-modal__close-btn, [data-testid*="close"]');
    console.log(`Found ${closeButtons.length} close button(s)`);
    closeButtons.forEach(btn => {
      try {
        if (btn.offsetParent !== null) { // Only click visible buttons
          btn.click();
          cleanupCount++;
        }
      } catch (e) {
        console.warn('Failed to click close button:', e);
      }
    });
    
    // Wait a moment for React state to update
    setTimeout(() => {
      // Metode 2: Hapus semua modal overlay dengan enhanced selectors
      const overlaySelectors = [
        '[data-chakra-modal-overlay]',
        '[data-robust-modal-overlay]',
        '.chakra-modal__overlay',
        '[role="presentation"]',
        '.modal-overlay'
      ];
      
      overlaySelectors.forEach(selector => {
        const overlays = document.querySelectorAll(selector);
        overlays.forEach(overlay => {
          console.log(`Removing overlay (${selector}):`, overlay);
          overlay.remove();
          cleanupCount++;
        });
      });
      
      // Metode 3: Hapus semua modal content dengan enhanced selectors
      const modalSelectors = [
        '[role="dialog"]',
        '[data-robust-modal]',
        '.chakra-modal__content',
        '[aria-modal="true"]',
        '.modal-content'
      ];
      
      modalSelectors.forEach(selector => {
        const modals = document.querySelectorAll(selector);
        modals.forEach(modal => {
          console.log(`Removing modal (${selector}):`, modal);
          modal.remove();
          cleanupCount++;
        });
      });
      
      // Metode 4: Reset body styles dengan enhanced cleanup
      const bodyStyles = ['overflow', 'paddingRight', 'position', 'top', 'width'];
      bodyStyles.forEach(style => {
        if (document.body.style[style]) {
          document.body.style[style] = '';
          console.log(`Reset body.style.${style}`);
        }
      });
      
      // Remove chakra-ui-light/dark class issues
      document.body.classList.remove('chakra-ui-modal-open', 'modal-open');
      
      // Metode 5: Hapus portal containers dengan enhanced selectors  
      const portalSelectors = [
        '[data-portal]',
        '.chakra-portal',
        '[id*="portal"]',
        '[id*="modal-root"]'
      ];
      
      portalSelectors.forEach(selector => {
        const portals = document.querySelectorAll(selector);
        portals.forEach(portal => {
          // Only remove if it contains modal content
          if (portal.querySelector('[role="dialog"], [data-chakra-modal-overlay]')) {
            console.log(`Removing portal (${selector}):`, portal);
            portal.remove();
            cleanupCount++;
          }
        });
      });
      
      // Metode 6: Enhanced ESC key dispatch
      const events = [
        new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, which: 27, bubbles: true }),
        new Event('modalClose', { bubbles: true }),
        new CustomEvent('forceModalClose', { bubbles: true, detail: { source: 'emergency-script' } })
      ];
      
      events.forEach(event => {
        document.dispatchEvent(event);
        window.dispatchEvent(event);
      });
      
      // Metode 7: Clear any stuck focus
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
      
      // Final verification after 500ms
      setTimeout(() => {
        const remainingModals = document.querySelectorAll('[role="dialog"], [data-chakra-modal-overlay]').length;
        const remainingOverlays = document.querySelectorAll('[data-chakra-modal-overlay]').length;
        
        console.log(`✅ CLEANUP COMPLETE:`);
        console.log(`- Items cleaned: ${cleanupCount}`);
        console.log(`- Remaining modals: ${remainingModals}`);
        console.log(`- Remaining overlays: ${remainingOverlays}`);
        
        if (remainingModals === 0 && remainingOverlays === 0) {
          console.log('🎉 SUCCESS: All modals successfully closed!');
        } else {
          console.log('⚠️ WARNING: Some modal elements still remain. Consider page refresh.');
        }
      }, 500);
      
    }, 100); // Small delay for React state updates
    
  } catch (error) {
    console.error('❌ Error during force close:', error);
    console.log('💡 Try running: location.reload() to refresh the page');
  }
}

// Function untuk reset React state (jika diperlukan)
function resetReactState() {
  console.log('Attempting to reset React component state...');
  
  // Trigger click pada background untuk close modal
  const overlay = document.querySelector('[data-chakra-modal-overlay]');
  if (overlay) {
    overlay.click();
  }
  
  // Trigger click pada tombol close jika ada
  const closeButtons = document.querySelectorAll('[aria-label*="close" i], [aria-label*="tutup" i]');
  closeButtons.forEach(button => {
    button.click();
  });
}

// Auto-run jika script dijalankan langsung
if (typeof window !== 'undefined') {
  // Expose functions to global scope
  window.forceCloseAllModals = forceCloseAllModals;
  window.resetReactState = resetReactState;
  
  console.log('Modal fix utilities loaded. Available functions:');
  console.log('- forceCloseAllModals(): Force close all modals');
  console.log('- resetReactState(): Attempt to reset React modal state');
  console.log('Usage: Just type the function name in console and press Enter');
}

// Export for module usage
if (typeof module !== 'undefined') {
  module.exports = {
    forceCloseAllModals,
    resetReactState
  };
}