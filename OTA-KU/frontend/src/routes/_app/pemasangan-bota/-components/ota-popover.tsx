import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SessionContext } from "@/context/session";
import { useContext, useEffect, useState } from "react";

// OTA type definition
export type OTA = {
  accountId: string;
  name: string;
  phoneNumber: string;
};

export function OTAPopover({
  isComboboxOpen,
  setIsComboboxOpen,
  onSelectOTA,
  buttonVariant,
  buttonText,
}: {
  isComboboxOpen: boolean;
  setIsComboboxOpen: (open: boolean) => void;
  onSelectOTA: (ota: OTA) => void;
  buttonVariant: "default" | "outline";
  buttonText: string;
}) {
  const session = useContext(SessionContext);
  const [otas, setOtas] = useState<OTA[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOTAs = async () => {
      setIsLoading(true);
      try {
        const response = await api.list.listAvailableOta({ page: 1 });
        if (response.success) {
          setOtas(
            response.body.data.map((ota) => ({
              accountId: ota.accountId,
              name: ota.name,
              phoneNumber: ota.phoneNumber,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching OTAs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOTAs();
  }, []);

  const isDisabled = session?.type !== "admin" && session?.type !== "bankes";

  return (
    <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={buttonVariant}
          className="w-full min-w-[90px] grow"
          disabled={isDisabled}
        >
          {buttonText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          {/* TODO: Nge search nya disini tanpa BE, tapi works kok (di BE baru bisa nge search pake nama doang). Tapi kata bacin kalo data nya udh banyak, bakal nge lag fe nya, mending di BE search nya */}
          <CommandInput placeholder="Cari nama atau no. whatsapp" />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>Tidak ada OTA yang ditemukan.</CommandEmpty>
                <CommandGroup>
                  {otas.map((ota) => (
                    <CommandItem
                      key={ota.accountId}
                      onSelect={() => onSelectOTA(ota)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col py-1">
                        <span className="text-dark font-medium">
                          {ota.name}
                        </span>
                        <span className="text-muted-foreground">
                          {ota.phoneNumber}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
