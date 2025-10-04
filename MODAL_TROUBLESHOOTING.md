# Modal Troubleshooting Guide

## Masalah: Modal Stuck/Tidak Bisa Ditutup

Jika Anda mengalami masalah dengan modal yang tidak bisa ditutup, ikuti langkah-langkah berikut:

### Langkah 1: Coba Metode Standard
1. **Klik tombol Close** - Tombol "Close" atau "Cancel" di footer modal
2. **Klik tombol X** - Tombol X di pojok kanan atas header modal
3. **Tekan ESC** - Tombol Escape di keyboard
4. **Klik di luar modal** - Klik pada area overlay di luar modal (hanya untuk view modal)

### Langkah 2: Browser Developer Tools
Jika metode standard tidak berhasil:

1. Buka **Developer Tools** (F12 atau Ctrl+Shift+I)
2. Buka tab **Console**
3. Jalankan salah satu perintah berikut:

```javascript
// Memaksa menutup semua modal
forceCloseAllModals()

// Reset state React
resetReactState()
```

### Langkah 3: Manual DOM Manipulation
Jika script utility tidak bekerja, coba perintah manual:

```javascript
// Hapus semua overlay modal
document.querySelectorAll('[data-chakra-modal-overlay]').forEach(el => el.remove())

// Hapus semua modal dialog
document.querySelectorAll('[role="dialog"]').forEach(el => el.remove())

// Reset body scroll
document.body.style.overflow = ''
document.body.style.paddingRight = ''
```

### Langkah 4: Refresh Halaman
Jika semua langkah di atas tidak berhasil:

1. **Soft refresh**: Ctrl+R atau F5
2. **Hard refresh**: Ctrl+Shift+R atau Ctrl+F5
3. **Clear cache**: Buka Developer Tools > Application > Storage > Clear site data

## Pencegahan Masalah Modal

### 1. Update Kode dengan Perbaikan
Komponen CustomerContacts telah diperbaiki dengan:
- Handler close yang lebih robust (`handleViewClose`)
- Multiple close methods (ESC, overlay click, close button)
- Explicit close button dengan icon X
- Enhanced modal props (`closeOnOverlayClick`, `closeOnEsc`)

### 2. Gunakan Custom Hook
Sebagai alternatif, gunakan hook `useModalState` yang lebih robust:

```typescript
import useModalState from '@/hooks/useModalState'

// Ganti useDisclosure dengan useModalState
const { isOpen, onOpen, onClose } = useModalState()
```

### 3. Best Practices
- Selalu reset state ketika menutup modal
- Gunakan multiple escape methods (ESC, overlay, button)
- Implementasi cleanup di useEffect
- Test modal behavior di berbagai kondisi

## Debugging Tips

### Cek State Modal
```javascript
// Cek apakah modal state masih true
console.log('Modal states:', {
  isViewOpen: // check in React DevTools,
  isAddOpen: // check in React DevTools,
  isEditOpen: // check in React DevTools
})
```

### Cek DOM Elements
```javascript
// Cek apakah ada modal di DOM
console.log('Modal overlays:', document.querySelectorAll('[data-chakra-modal-overlay]').length)
console.log('Modal dialogs:', document.querySelectorAll('[role="dialog"]').length)
```

### Monitor Event Listeners
```javascript
// Cek apakah event listeners attached
getEventListeners(document) // Di Chrome DevTools
```

## Solusi Permanen

Untuk mencegah masalah ini berulang:

1. **Update dependencies**: Pastikan Chakra UI dan React versi terbaru
2. **Code review**: Periksa implementasi modal management
3. **Testing**: Test modal behavior secara menyeluruh
4. **Error boundaries**: Implementasi error handling yang proper

## Kontak Support

Jika masalah persisten, dokumentasikan:
- Browser dan versi
- Steps to reproduce
- Console errors
- Screenshots

Lalu laporkan kepada tim development untuk investigasi lebih lanjut.