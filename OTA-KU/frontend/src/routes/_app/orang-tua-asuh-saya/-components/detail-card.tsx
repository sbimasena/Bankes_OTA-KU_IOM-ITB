import { MyOtaDetailResponse } from "@/api/generated";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { censorEmail } from "@/lib/formatter";
import {
  Calendar,
  CircleDollarSign,
  Mail,
  Phone,
} from "lucide-react";
import React from "react";

const DetailCardsOrangTuaAsuh: React.FC<MyOtaDetailResponse> = ({
  name,
  email,
  phoneNumber,
  transferDate,
  isDetailVisible,
  createdAt,
}) => {
  return (
    <div className="flex w-full max-w-[300px] justify-center">
      <div className="flex w-full flex-col gap-4">
        <Card className="mx-auto w-full md:max-w-sm">
          <CardHeader className="flex flex-col items-center justify-center pt-6 pb-4">
            <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-100">
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                {name.charAt(0)}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold xl:text-xl">{name}</h2>
              <p className="text-muted-foreground">Orang Tua Asuh</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-primary space-y-3 text-sm xl:text-base">
              <div className="flex items-start space-x-3">
                <Mail className="text-muted-foreground h-5 w-5" />
                <a
                  href={isDetailVisible ? `mailto:${email}` : "#"}
                  target={isDetailVisible ? "_blank" : "_self"}
                  className="text-sm"
                >
                  {isDetailVisible ? email : censorEmail(email)}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="text-muted-foreground h-5 w-5" />
                <a
                  href={isDetailVisible ? `https://wa.me/${phoneNumber}` : "#"}
                  target={isDetailVisible ? "_blank" : "_self"}
                  className="text-sm"
                >
                  +{isDetailVisible ? phoneNumber : "**********"}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <CircleDollarSign className="text-muted-foreground min-h-5 min-w-5" />
                <span className="text-sm">
                  Bantuan dikirim tanggal {transferDate} untuk setiap bulan
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="text-muted-foreground h-5 w-5" />
                <span className="text-sm">
                  Terdaftar sejak{" "}
                  {new Date(createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetailCardsOrangTuaAsuh;
