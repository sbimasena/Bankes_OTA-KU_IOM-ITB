import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { genders, religions } from "./data";
import { MahasiswaRegistrationFormValues } from "./pendaftaran-mahasiswa";

function Combobox({
  form,
  name,
}: {
  form: UseFormReturn<MahasiswaRegistrationFormValues>;
  name: "religion" | "gender";
}) {
  const [open, setOpen] = useState(false);

  const datas = name === "religion" ? religions : genders;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-primary text-sm after:text-red-500 after:content-['*']">
            {name === "religion" ? "Agama" : "Jenis Kelamin"}
          </FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between rounded-md",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value
                    ? datas.find((data) => data.value === field.value)?.label
                    : `Pilih ${name === "religion" ? "agama" : "jenis kelamin"}`}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {datas.map((data) => (
                      <CommandItem
                        value={data.label}
                        key={data.value}
                        onSelect={() => {
                          form.setValue(name, data.value);
                          setOpen(false);
                        }}
                      >
                        {data.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            data.value === field.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default Combobox;
