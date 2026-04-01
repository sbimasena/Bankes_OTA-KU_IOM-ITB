/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ListTerminateForAdmin = {
  /**
   * ID orang tua asuh
   */
  otaId: string;
  otaName: string;
  otaNumber: string;
  /**
   * ID mahasiswa asuh
   */
  mahasiswaId: string;
  maName: string;
  maNIM: string;
  createdAt: string;
  requestTerminateOTA: boolean;
  requestTerminateMA: boolean;
  requestTerminationNoteOTA: string;
  requestTerminationNoteMA: string;
};

