import { api } from "@/api/client";
import { UserSchema } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

function LandingPage({ session }: { session: UserSchema | null | undefined }) {
  const isLoggedIn = !!session;
  const [activeIndex, setActiveIndex] = useState(0);

  const { data } = useQuery({
    queryKey: ["publicTestimonialsHome"],
    queryFn: () => api.testimonial.listPublicTestimonials({ limit: 10 }),
  });

  const testimonials = data?.body.data ?? [];

  const current = testimonials[activeIndex];

  const next = () => {
    if (!testimonials.length) return;
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    if (!testimonials.length) return;
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-10 px-3 lg:gap-15">
      {/* Text and icon */}
      <div className="flex flex-col items-center gap-6 lg:flex-row-reverse lg:gap-15 xl:gap-30">
        {/* Icon */}
        <img
          src="/icon/logo-basic.png"
          alt="landing page"
          className="w-[140px] lg:w-[330px]"
        />
        {/* Text */}
        <div className="text-dark flex flex-col gap-2">
          <h1 className="text-center text-[32px] font-bold lg:text-justify lg:text-[50px]">
            Orang Tua Asuh Ku (OTA-KU)
          </h1>
          <p className="w-full max-w-[700px] text-justify text-sm opacity-80 lg:max-w-[845px] lg:text-2xl">
            OTA-KU adalah program bantuan pendidikan bagi mahasiswa ITB yang
            mengalami kendala finansial. Melalui kolaborasi bersama IOM ITB,
            Anda bisa berperan sebagai Orang Tua Asuh—baik secara individu
            maupun lembaga—untuk memberikan dukungan berupa dana UKT, biaya
            hidup, atau keperluan akademik lainnya.
          </p>
        </div>
      </div>

      {/* Button */}
      {!isLoggedIn && (
        <Button
          variant={"outline"}
          size={"xl"}
          className="w-full max-w-[350px]"
          asChild
        >
          <Link to="/auth/login">Bergabung Sekarang</Link>
        </Button>
      )}

      <section className="w-full max-w-5xl rounded-2xl bg-white p-4 shadow-md md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-dark text-xl font-bold md:text-3xl">Suara Mahasiswa OTA-KU</h2>
          {testimonials.length > 1 && (
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={prev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={next}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {!current ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
            Testimoni akan tampil setelah dikonfirmasi dan diaktifkan admin.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-base leading-relaxed md:text-lg">"{current.content}"</p>
              <div>
                <p className="text-muted-foreground text-xs">
                  {[current.faculty, current.major].filter(Boolean).join(" - ") || "Mahasiswa ITB"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(current.images.length ? current.images : ["/icon/logo-basic.png"]).slice(0, 3).map((img, idx) => (
                <img
                  key={`${img}-${idx}`}
                  src={img}
                  alt={`testimoni-image-${idx + 1}`}
                  className="h-32 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

export default LandingPage;
