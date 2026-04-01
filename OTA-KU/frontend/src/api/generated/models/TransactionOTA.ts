/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TransactionOTA = {
  /**
   * ID transaksi
   */
  id: string;
  /**
   * ID transaksi
   */
  mahasiswa_id: string;
  name: string;
  /**
   * Nomor Induk Mahasiswa
   */
  nim: string;
  bill: number;
  amount_paid: number;
  paid_at: string;
  due_date: string;
  status: 'unpaid' | 'pending' | 'paid';
  receipt: string;
  /**
   * Alasan penolakan verifikasi pembayaran
   */
  rejection_note?: string;
  /**
   * Jumlah bulan yang dibayarkan
   */
  paid_for: number;
};

