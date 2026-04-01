// OTA type definition
export type OTA = {
  id: string;
  name: string;
  phoneNumber: string;
  donationAmount: string;
  maxStudents: number;
  criteria: string;
  additionalInfo?: string;
};

// Sample data
export const otaList: OTA[] = [
  {
    id: "1",
    name: "Dummy Budi Santoso",
    phoneNumber: "6281234567890",
    donationAmount: "500.000 per bulan",
    maxStudents: 3,
    criteria:
      "Berprestasi, aktif dalam kegiatan sosial, berasal dari keluarga kurang mampu. Berprestasi, aktif dalam kegiatan sosial, berasal dari keluarga kurang mampu. Berprestasi, aktif dalam kegiatan sosial, berasal dari keluarga kurang mampu.",
    additionalInfo:
      "Bapak Budi memiliki pengalaman panjang dalam mendukung pendidikan anak-anak di daerah terpencil.",
  },
  {
    id: "2",
    name: "Dummy Siti Aminah",
    phoneNumber: "6289876543210",
    donationAmount: "300.000 per bulan",
    maxStudents: 2,
    criteria: "Berprestasi akademik, memiliki minat di bidang sains dan teknologi",
    additionalInfo:
      "Ibu Siti adalah seorang dosen yang ingin membantu mahasiswa dengan potensi besar di bidang STEM.",
  },
  {
    id: "3",
    name: "Dummy Andi Wijaya",
    phoneNumber: "6281122334455",
    donationAmount: "750.000 per bulan",
    maxStudents: 4,
    criteria: "Berprestasi di bidang olahraga, memiliki semangat juang tinggi",
    additionalInfo:
      "Pak Andi adalah mantan atlet nasional yang ingin mendukung generasi muda berbakat di bidang olahraga.",
  },
  {
    id: "4",
    name: "Dummy Maria Kristina",
    phoneNumber: "6285566778899",
    donationAmount: "1.000.000 per bulan",
    maxStudents: 5,
    criteria: "Berprestasi di seni, memiliki bakat di musik atau seni rupa",
    additionalInfo:
      "Ibu Maria adalah seorang seniman yang ingin memberikan kesempatan kepada anak-anak berbakat untuk berkembang di dunia seni.",
  },
  {
    id: "5",
    name: "Dummy Joko Prasetyo",
    phoneNumber: "6289988776655",
    donationAmount: "600.000 per bulan",
    maxStudents: 3,
    criteria: "Berprestasi akademik, berasal dari daerah terpencil",
    additionalInfo:
      "Pak Joko adalah seorang pengusaha yang memiliki komitmen untuk meningkatkan akses pendidikan di daerah terpencil.",
  },
];
