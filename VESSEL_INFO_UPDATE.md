# Vessel Information Layout Update

## Summary ✅

Saya telah mengupdate format **vessel information section** agar sesuai dengan gambar referensi yang Anda berikan.

## 📋 **Changes Made**

### Before:
```
Nama armada   : MT. FERIMAS SEJAHTERA    Pemilik  : PT. Indoline Incomekita
Ukuran armada : LOA                      Tipe     : OIL TANKER
              : LBP                      DWT/GT   : 762 GT
              : B                        Dok Type : Special Survey  
              : H                        Status   : SPECIAL SURVEY

LOA: 64.02 meter | LBP: 59.90 meter | B: 10.00 meter | H: 4.50 meter
```

### After (Sesuai Gambar):
```
Nama Kapal    : MT. FERIMAS SEJAHTERA    Pemilik  : PT. Indoline Incomekita
Ukuran utama    LOA                      Tipe     : OIL TANKER
                LBP                      GRT      : 762 GT
                BM                       Status   : SPECIAL SURVEY
                T

LOA: 64.02 meter | LBP: 59.9 meter | B: 10 meter | H: 4.5 meter
```

## 🔄 **Key Improvements**

1. **Label Changes**:
   - `Nama armada` → `Nama Kapal`
   - `Ukuran armada` → `Ukuran utama`
   - `DWT/GT` → `GRT`
   - `B` → `BM`
   - Removed `Dok Type` field

2. **Structure Changes**:
   - `Ukuran utama` tidak ada titik dua (`:`)
   - LOA, LBP, BM, T sebagai sub-items tanpa titik dua
   - LOA, LBP, BM, T ditampilkan dengan **bold** formatting

3. **Layout Improvements**:
   - Detailed measurements tetap di bawah dalam satu baris
   - Spacing dan alignment disesuaikan dengan referensi

## 📁 **Files Updated**

1. **`src/lib/exactReplicaPdfService.ts`**
   - Updated vessel information HTML structure
   - Changed labels and formatting to match reference

2. **`test-docking-report-preview.html`** 
   - Updated preview with matching format
   - Shows exact appearance for testing

## 🚀 **Result**

Sekarang vessel information section akan tampil persis seperti dalam gambar referensi:

```
Nama Kapal      : MT. FERIMAS SEJAHTERA      Pemilik  : PT. Indoline Incomekita
Ukuran utama      LOA                         Tipe     : OIL TANKER  
                  LBP                         GRT      : 762 GT
                  BM                          Status   : SPECIAL SURVEY
                  T

LOA: 64.02 meter | LBP: 59.9 meter | B: 10 meter | H: 4.5 meter
```

Format sekarang identik dengan gambar yang Anda berikan! 🎯