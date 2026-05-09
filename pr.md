# Starter repo PR — Tapy form helper (`nextjs-starter-template`)

**Tarih:** 9 Mayıs 2026  
**Hedef repo:** GitHub `tapy-dev/nextjs-starter-template` (backend env ile override: `GITHUB_TEMPLATE_OWNER`, `GITHUB_TEMPLATE_REPO`, `GITHUB_TEMPLATE_REF`).  
**Bağlam:** `tapy-to` monorepo içindeki [`form-upgrade.md`](./form-upgrade.md) §0 pre-flight ile uyumlu; LLM **bu dosyayı yazmayacak**, tek kaynak starter’daki sabit modül.

---

## PR özeti

| Alan | Değer |
|------|--------|
| **Başlık örneği** | `feat(forms): add submitTapyForm helper + project id wiring` |
| **Branch örneği** | `feat/tapy-form-submit-may9` |
| **Amaç** | Üretilen sitelerde formlar tek kontratla `POST /api/v1/form/:projectId` adresine gitsin; endpoint URL hardcode edilmesin; backend JSON hata şeması helper tarafından parse edilebilsin. |

---

## Eklenmesi / güncellenmesi gerekenler

### 1. Yeni dosya: form submit modülü

**Önerilen yol:** App Router kullanılıyorsa `src/lib/tapy-form-submit.ts` (repo kök yapın `src/` kullanmıyorsa eşdeğer — önemli olan tek bir canonical path olması).

İçerik gereksinimleri:

1. **Tipler** — `form-upgrade.md` §0.3 ile birebir:

   - `SubmitTapyFormResult`
   - `FormSubmitErrorPayload` (`code`, `message`, opsiyonel `fields: Record<string, string[]>`)
   - `SubmitTapyFormOptions` (`onSuccess`, `onError`)

2. **`submitTapyForm(event: SubmitEvent, options?)`**

   - İçeride `event.preventDefault()` ve `event.stopPropagation()` (gerekirse).
   - `event.currentTarget` bir `<form>` olmalı; değilse rejected promise veya `{ success: false, error: { code: 'INVALID_FORM', message: '...' } }`.
   - Formdan okunacak **data attribute’lar:**
     - `data-tapy-form-kind` → gövdeye `formKind` veya backend’in beklediği alan adıyla uyumlu şekilde ekle (şu an backend düz JSON bekliyor — aşağıda payload notu).
     - `data-tapy-form-id` → `formId` (regex: `^[a-z0-9-]{1,50}$`).
     - `data-tapy-form-version` → sayı string/int (backend henüz kullanmıyorsa bile gönder; ileride kullanılacak).

3. **Payload oluşturma**

   - `FormData` ile tüm alanları topla; `_honeypot`, `_form_render_at` gibi alanlar prompt’ta kalacak — helper silmesin.
   - `formKind` / `formId` / `formVersion`: attribute’tan gelen değerleri JSON gövdesine ekle (backend `normalizeFormPayload` ile uyumlu olacak şekilde — mevcut backend `formKind`’ı body’den veya infer ile alıyor; **en az** `formKind` anahtarının gönderildiğinden emin ol).

4. **Endpoint**

   - Base URL: **`process.env.NEXT_PUBLIC_TAPY_API_URL`** (veya aynı anlama gelen tek isim — README’de sabitle).
   - Project ID: **`process.env.NEXT_PUBLIC_TAPY_PROJECT_ID`** **veya** DOM’daki `<meta name="tapy-project-id" content="...">` (ikincisi öncelikli olabilir — deploy edilen sayfada meta injection sık kullanılıyor).
   - Tam path: `` `${base.replace(/\/$/, '')}/api/v1/form/${projectId}` ``  
     Backend route: `nestjs-backend/src/forms/forms.controller.ts` → `@Controller('api/v1/form')`.

5. **Fetch**

   - `method: 'POST'`
   - `headers: { 'Content-Type': 'application/json', Accept: 'application/json' }`
   - `body: JSON.stringify(payload)`
   - `credentials: 'omit'` veya CORS politikasına göre `'same-origin'` — public API cross-origin ise backend CORS’ta site origin’i taşımalı; şimdilik **`omit`** + JSON yaygın.

6. **Yanıt işleme**

   - **2xx** ve JSON `{ success: true, id?: string }` → başarı; `onSuccess` çağır.
   - **422** veya gövdede `success: false` → `FormSubmitErrorPayload` parse et; `fields` varsa `onError`; kullanıcıya genel mesaj için `error.message`.
   - **429** → `code: 'RATE_LIMITED'` benzeri tek tip hata nesnesi üret (backend henüz göndermese bile).
   - Network hatası → `{ success: false, error: { code: 'NETWORK_ERROR', message: '...' } }`.

7. **Opsiyonel:** `submitTapyFormFromElement(form: HTMLFormElement, options?)` — aynı mantık; vanilla veya test için.

---

### 2. Proje kimliği (projectId) — layout veya metadata

Backend URL şu biçimde: `/api/v1/form/:projectId`.

Starter’da en az biri **kesin** olmalı:

- **Öneri A:** `src/app/layout.tsx` içinde:

  ```tsx
  <meta name="tapy-project-id" content={process.env.NEXT_PUBLIC_TAPY_PROJECT_ID ?? ''} />
  ```

  (`metadata` API kullanılıyorsa `export const metadata` veya `generateMetadata` ile eşdeğer.)

- **Öneri B:** Sadece env — helper sadece `NEXT_PUBLIC_TAPY_PROJECT_ID` okur.

Üretim ortamında değer genelde deploy pipeline / Tapy tarafından set edilir; starter’da **boş string** durumunda helper anlamlı hata döndürsün: `code: 'MISSING_PROJECT_ID'`.

---

### 3. Ortam değişkenleri — `.env.example`

Şablon satırlar (yorumlarla):

```env
# Tapy API (no trailing slash)
NEXT_PUBLIC_TAPY_API_URL=https://api.tapy.to

# Set per deployment / preview (UUID)
NEXT_PUBLIC_TAPY_PROJECT_ID=
```

İsteğe bağlı (ileri uyumluluk):

```env
# NEXT_PUBLIC_TAPY_FORM_API_PATH=/api/v1/form  # default if omitted
```

---

### 4. README veya `docs/FORM.md` (kısa)

- LLM / geliştirici için:
  - Formlarda **`action` ve `method` yazılmaz**; `onSubmit` → `submitTapyForm`.
  - **`data-tapy-form-kind`**, **`data-tapy-form-id`**, **`data-tapy-form-version`** zorunlu kontrat (prompt ile hizalanacak).
  - `formId` / `formKind` karakter kuralları: `form-upgrade.md` §0.5.

---

### 5. (İsteğe bağlı) Küçük örnek bileşen

`src/components/examples/contact-form-example.tsx` — commit mesajında “örnek” olduğu belirtilsin; prod bundle’a zorunlu değil (tree-shake). Amaç: PR reviewer’ın helper’ı hızlı görmesi.

---

### 6. TypeScript ve lint

- `export` edilen tipler projede kullanılabilir olsun.
- `strict` TS ile uyumlu yaz.
- Mevcut ESLint kurallarına uy.

---

## Backend ile uyumluluk notları (bu PR kapsamında kod değişmez)

- Şu an backend gövdeyi `normalizeFormPayload(formData)` ile işliyor; gönderilen JSON’da **`formKind`** (veya mevcut normalize’ın beklediği anahtarlar) bulunmalı — starter helper’ı attribute’tan **`formKind`** üretip body’ye eklemeli.
- Başarı yanıtı bugün: `{ success: true, id: submission.id }` — helper bunu desteklemeli.
- Hata gövdesi strict validation geldiğinde §0.4 şemasına geçecek; helper **hem esnek parse** (sadece `message` string) hem **tam şema** yapabilmeli.

---

## PR açıklaması için şablon (İngilizce)

```markdown
## Summary
Adds a canonical `submitTapyForm` client for Tapy-generated sites so forms POST to `/api/v1/form/:projectId` without hardcoded API URLs. Aligns with internal contract (form-upgrade.md §0).

## Changes
- `src/lib/tapy-form-submit.ts` — types + `submitTapyForm` + optional `submitTapyFormFromElement`
- `.env.example` — `NEXT_PUBLIC_TAPY_API_URL`, `NEXT_PUBLIC_TAPY_PROJECT_ID`
- `layout` / metadata — `meta name="tapy-project-id"` when env is set
- README or docs snippet for form markup rules

## How to test
1. Set env vars to local backend (`NEXT_PUBLIC_TAPY_API_URL=http://localhost:4000`) and a real `projectId`.
2. Mount a form with `data-tapy-form-kind="contact"`, honeypot field, submit.
3. Expect 200 + `{ success: true, id }` or validation errors per §0.4.

## Out of scope
- Backend Zod / rate limit / prompt updates (separate repo).
```

---

## Merge sonrası (Tapy backend tarafı — hatırlatma)

- Template zipball yeni commit’ten çekilecek; **yeni proje** bootstrap’ları helper’ı otomatik alır.
- Eski snapshot’lı projeler için ayrı migration / dosya inject gerekirse `SpriteLifecycleService` ile takip edilir (monorepo işi).

---

*Bu dosya `tapy-to` içinde referans amaçlıdır; asıl değişiklik `nextjs-starter-template` PR’ında yapılır.*
