export function paymentThankyouMessage(params: {
  otaName: string;
  mahasiswaName: string;
  amount: number;
  paidAt: Date;
}): string {
  const { otaName, mahasiswaName, amount, paidAt } = params;
  const dateStr = paidAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = paidAt.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return (
    `Yth. ${otaName},\n\n` +
    `Terima kasih! Pembayaran bantuan untuk ${mahasiswaName} ` +
    `sebesar Rp${amount.toLocaleString("id-ID")} telah kami terima pada ${dateStr} pukul ${timeStr} WIB.\n\n` +
    `Kontribusi Anda sangat berarti bagi perjalanan studi mereka.\n\n` +
    `Salam hangat,\n IOM`
  );
}
