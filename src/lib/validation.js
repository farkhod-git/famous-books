/**
 * Backenddagi qoidalar bilan bir xil bo'lishi kerak:
 *   RegisterDto / LoginDto — parol @Length(min = 6, max = 20)
 *   RegisterDto.email      — ^[a-zA-Z0-9_.-]+@[a-zA-Z0-9.-]+$   ("+" ga ruxsat yo'q)
 *
 * Maqsad — foydalanuvchi serverdan tushunarsiz xato olmasdan oldin
 * nima noto'g'riligini ko'rsatish.
 */
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 20;

/* Backend register uchun aynan shu naqshni ishlatadi. */
export const EMAIL_PATTERN = "[a-zA-Z0-9_.-]+@[a-zA-Z0-9.-]+";
const EMAIL_RE = new RegExp(`^${EMAIL_PATTERN}$`);

export function requiredError(value, label) {
  return value?.trim() ? null : `${label} kiritilishi shart`;
}

export function emailError(value) {
  const email = value?.trim();
  if (!email) return "Email kiritilishi shart";
  if (!EMAIL_RE.test(email)) return "Email formati noto'g'ri (masalan: ism@pochta.uz)";
  return null;
}

export function passwordError(value) {
  if (!value) return "Parol kiritilishi shart";
  if (value.length < PASSWORD_MIN) return `Parol kamida ${PASSWORD_MIN} ta belgidan iborat bo'lsin`;
  if (value.length > PASSWORD_MAX) return `Parol ko'pi bilan ${PASSWORD_MAX} ta belgi bo'lsin`;
  return null;
}

export function passwordMatchError(password, repeat) {
  if (!repeat) return "Parolni takrorlang";
  return password === repeat ? null : "Parollar bir xil emas";
}

/** Bo'sh qiymatlarni olib tashlaydi — xatolar bo'lmasa null qaytaradi. */
export function collect(errors) {
  const found = Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
  return Object.keys(found).length ? found : null;
}
