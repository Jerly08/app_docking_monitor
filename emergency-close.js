// SIMPLE MODAL CLOSE SCRIPT
// Copy dan paste ke browser console jika modal stuck

console.log('🔧 SIMPLE MODAL CLOSE SCRIPT');
console.log('Trying to close stuck modals...');

// Method 1: Click close buttons
const closeButtons = document.querySelectorAll('[aria-label*="close" i]');
console.log(`Found ${closeButtons.length} close button(s)`);
closeButtons.forEach(btn => btn.click());

// Method 2: Send ESC key
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

// Method 3: Reset body scroll if locked
if (document.body.style.overflow === 'hidden') {
  document.body.style.overflow = '';
  console.log('Body scroll restored');
}

// Check result
setTimeout(() => {
  const modals = document.querySelectorAll('[role="dialog"]').length;
  if (modals === 0) {
    console.log('✅ SUCCESS: Modals closed!');
  } else {
    console.log('⚠️ Still has modals. Try: location.reload()');
  }
}, 500);

console.log('🔄 Done. If modal still stuck, refresh page (Ctrl+R)');

// Simple helper for future use
window.closeModal = () => {
  document.querySelectorAll('[aria-label*="close" i]').forEach(btn => btn.click());
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
};
