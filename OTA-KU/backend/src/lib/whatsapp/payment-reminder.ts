export function paymentReminderMessage(params: {
  otaName: string;
  mahasiswaName: string;
  bill: number;
  dueDateStr: string;
  daysLeft: number;
}): string {
  const { otaName, mahasiswaName, bill, dueDateStr, daysLeft } = params;
  return (
    `Yth. ${otaName},\n\n` +
    `Ini adalah pengingat bahwa tagihan pembayaran bantuan untuk ${mahasiswaName} ` +
    `sebesar Rp${bill.toLocaleString("id-ID")} akan jatuh tempo pada ${dueDateStr} ` +
    `(${daysLeft} hari lagi).\n\n` +
    `Mohon segera lakukan pembayaran melalui platform OTA-KU.\n\nTerima kasih.`
  );
}

export function groupPaymentReminderMessage(params: {
  otaName: string;
  mahasiswaName: string;
  amount: number;
  dueDateStr: string;
  daysLeft: number;
}): string {
  const { otaName, mahasiswaName, amount, dueDateStr, daysLeft } = params;
  return (
    `Yth. ${otaName},\n\n` +
    `Ini adalah pengingat bahwa tagihan pembayaran bantuan kelompok untuk ${mahasiswaName} ` +
    `sebesar Rp${amount.toLocaleString("id-ID")} akan jatuh tempo pada ${dueDateStr} ` +
    `(${daysLeft} hari lagi).\n\n` +
    `Mohon segera lakukan pembayaran melalui platform OTA-KU.\n\nTerima kasih.`
  );
}
