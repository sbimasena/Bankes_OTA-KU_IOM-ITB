/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TransactionListAdminData = {
  id: string;
  mahasiswa_id: string;
  ota_id: string;
  name_ma: string;
  /**
   * Nomor Induk Mahasiswa
   */
  nim_ma: string;
  name_ota: string;
  /**
   * Nomor telepon pengguna yang dimulai dengan 62.
   */
  number_ota: string;
  bill: number;
  amount_paid: number;
  paid_at: string;
  due_date: string;
  /**
   * Jumlah bulan yang dibayarkan
   */
  paid_for: number;
  status: 'unpaid' | 'pending' | 'paid';
  transferStatus: 'unpaid' | 'paid';
  receipt: string;
  createdAt: string;
};

