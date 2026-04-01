export default function Footer() {
  return (
    <footer className="border-t-dark/10 w-full border-t-[1px] bg-[#F2F7FC]">
      <div className="items-center justify-center space-y-8 px-8 py-6 md:flex md:space-y-0">
        <div>
          <div className="mb-6 flex items-center">
            <img src="/logo-iom.svg" alt="IOM-ITB Logo" className="w-full" />
          </div>

          <div className="flex flex-col">
            <p className="text-primary">
              Kota Bandung, Coblong Sekretariat IOM-ITB
            </p>
            <p className="text-primary">
              Gedung Kampus Center Timur ITB Lantai 2
            </p>
            <p className="text-primary">
              Jl. Ganesha No. 10 Kec. Coblong 40132.
            </p>
          </div>
        </div>
        <div className="flex flex-col">
          <h4 className="text-primary mb-2 font-bold">KONTAK</h4>
          <a
            href="mailto:sekretariat.iom.itb@gmail.com"
            className="text-primary"
          >
            sekretariat.iom.itb@gmail.com
          </a>
          <p className="text-primary">+62 856-2465-4990</p>
          <div className="mt-2 flex space-x-3">
            <a
              href="https://www.instagram.com/iom_itb"
              target="_blank"
              className="text-primary"
            >
              <img src="/ig.svg" alt="Instagram" className="w-8" />
            </a>
            <a
              href="https://www.youtube.com/@iom-itb"
              target="_blank"
              className="text-primary"
            >
              <img src="/yt.svg" alt="YouTube" className="w-8" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
