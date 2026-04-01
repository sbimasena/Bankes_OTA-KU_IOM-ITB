/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TransactionListVerificationAdminData = {
  /**
   * ID orang tua asuh
   */
  ota_id: string;
  name_ota: string;
  /**
   * Nomor telepon pengguna yang dimulai dengan 62.
   */
  number_ota: string;
  totalBill: number;
  transactions: Array<{
    /**
     * ID transaksi
     */
    id: string;
    /**
     * ID mahasiswa asuh
     */
    mahasiswa_id: string;
    name_ma: string;
    /**
     * Nomor Induk Mahasiswa
     */
    nim_ma: string;
    paidAt: string;
    dueDate: string;
    bill: number;
    receipt: string;
    /**
     * Alasan penolakan verifikasi pembayaran
     */
    rejectionNote: string;
    transactionStatus: 'unpaid' | 'pending' | 'paid';
  }>;
};

