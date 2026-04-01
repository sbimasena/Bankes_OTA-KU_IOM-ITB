import { AllAccountListElement } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import DeleteAccountDialog from "./delete-account-dialog";
import DetailDialog from "./detail-dialog";

function DropdownMenuAccount({ account }: { account: AllAccountListElement }) {
  const [open, setOpen] = useState(false);
  const [dialogMenu, setDialogMenu] = useState<string>("none");

  function handleDialogMenu() {
    switch (dialogMenu) {
      case "detail":
        return <DetailDialog account={account} />;
      case "delete":
        return <DeleteAccountDialog account={account} setOpen={setOpen} />;
      default:
        return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialogMenu("detail")} asChild>
            <DialogTrigger className="flex w-full cursor-pointer gap-2">
              <Eye className="h-4 w-4" />
              Lihat Detail
            </DialogTrigger>
          </DropdownMenuItem>
          {account.type !== "admin" && (
            <DropdownMenuItem onSelect={() => setDialogMenu("delete")} asChild>
              <DialogTrigger className="flex w-full cursor-pointer gap-2 text-red-600">
                <Trash2 className="h-4 w-4" />
                Delete
              </DialogTrigger>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {handleDialogMenu()}
    </Dialog>
  );
}

export default DropdownMenuAccount;
