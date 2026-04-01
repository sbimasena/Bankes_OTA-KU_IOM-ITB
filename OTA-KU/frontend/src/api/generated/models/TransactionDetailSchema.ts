/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TransactionDetailSchema = {
  nama_ma: string;
  /**
   * Nomor Induk Mahasiswa
   */
  nim_ma: string;
  fakultas: string;
  jurusan: string;
  data: Array<{
    tagihan: number;
    pembayaran: number;
    due_date: string;
    status_bayar: 'unpaid' | 'pending' | 'paid';
    bukti_bayar: string;
  }>;
  totalData: number;
};

