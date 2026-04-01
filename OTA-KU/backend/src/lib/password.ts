export function generateSecurePassword(length: number = 12): string {
  if (length < 8) throw new Error("Password minimal 8 karakter");

  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digit = "0123456789";
  const symbol = "!@#$%^&*()_-+=[\\]{};':\"\\|,.<>/?";
  const all = lower + upper + digit + symbol;

  // Pastikan setiap kategori karakter ada minimal satu
  let password = [
    lower.charAt(Math.floor(Math.random() * lower.length)),
    upper.charAt(Math.floor(Math.random() * upper.length)),
    digit.charAt(Math.floor(Math.random() * digit.length)),
    symbol.charAt(Math.floor(Math.random() * symbol.length)),
  ];

  // Sisa karakter diisi random dari semua karakter
  const randomValues = new Uint32Array(length - 4);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < randomValues.length; i++) {
    password.push(all.charAt(randomValues[i] % all.length));
  }

  // Shuffle password agar urutan karakter tidak bisa ditebak
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}
