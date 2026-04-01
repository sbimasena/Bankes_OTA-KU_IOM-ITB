import { api } from "@/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { DataTable } from "../../data-hubungan-asuh/-components/data-table";
import { transactionColumns } from "./columns";
import FilterMonth from "./filter-month";
import FilterYear from "./filter-year";
import TransactionCard from "./transaction-card";

function TransactionStatusContent() {
  const [year, setYear] = useState<number | null>(new Date().getFullYear());
  const [month, setMonth] = useState<number | null>(new Date().getMonth() + 1);

  const { data, isLoading } = useQuery({
    queryKey: ["listAllTransaction", year, month],
    queryFn: () => api.transaction.listTransactionOta({ year, month }),
  });

  // Add total bill data to create a summary row
  const tableData = data?.body.data || [];
  const totalBill = data?.body.totalBill ?? 0;

  // Add total row to the data only if there's actual data
  const dataWithTotal =
    tableData.length > 0
      ? [
          ...tableData,
          {
            id: "total",
            mahasiswa_id: "total",
            name: "TOTAL",
            nim: "",
            bill: totalBill,
            amount_paid: 0,
            paid_at: "",
            created_at: new Date(),
            due_date: "",
            status: "paid" as const,
            receipt: "",
            rejection_note: "",
            paid_for: 0,
          },
        ]
      : [];

  const notPaidData = tableData.filter((item) => item.status !== "paid");

  return (
    <section className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
          <FilterYear
            years={data?.body.years || []}
            year={year}
            setYear={setYear}
          />
          <FilterMonth month={month} setMonth={setMonth} />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <DataTable columns={transactionColumns} data={dataWithTotal} />
      )}

      {/* Transaction Form */}
      {isLoading ? (
        <div className="rounded-md bg-white">
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        notPaidData.length > 0 && (
          <TransactionCard
            data={notPaidData}
            year={year ?? 0}
            month={month ?? 0}
          />
        )
      )}
    </section>
  );
}

export default TransactionStatusContent;
