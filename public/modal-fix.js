/**
 * Emergency Modal Close Utility
 * 
 * Jika modal masih stuck, gunakan script ini di browser console
 * atau jalankan dari developer tools untuk memaksa menutup modal
 */

// Function untuk memaksa menutup semua modal Chakra UI
function forceCloseAllModals() {
  console.log('Attempting to force close all modals...');
  
  // Metode 1: Hapus semua modal overlay
  const overlays = document.querySelectorAll('[data-chakra-modal-overlay]');
  overlays.forEach(overlay => {
    console.log('Removing modal overlay:', overlay);
    overlay.remove();
  });
  
  // Metode 2: Hapus semua modal content
  const modals = document.querySelectorAll('[role="dialog"]');
  modals.forEach(modal => {
    console.log('Removing modal:', modal);
    modal.remove();
  });
  
  // Metode 3: Reset body scroll
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  
  // Metode 4: Hapus modal root jika ada
  const modalRoot = document.querySelector('[data-portal]');
  if (modalRoot) {
    console.log('Removing modal portal:', modalRoot);
    modalRoot.remove();
  }
  
  // Metode 5: Dispatch ESC key event
  const escEvent = new KeyboardEvent('keydown', {
    key: 'Escape',
    keyCode: 27,
    which: 27
  });
  document.dispatchEvent(escEvent);
  
  console.log('Force close completed. If modal is still visible, try refreshing the page.');
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