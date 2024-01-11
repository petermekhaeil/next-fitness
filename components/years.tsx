"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Years({ selectedYear }: { selectedYear: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const years = [...Array(4).keys()].map((i) => new Date().getFullYear() - i);

  const handleChangeYear = (year: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("year", String(year));
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs
      defaultValue={selectedYear + ""}
      className="flex w-full"
      onValueChange={(value) => handleChangeYear(Number(value))}
    >
      <TabsList>
        {years.map((year) => (
          <TabsTrigger key={year} value={year + ""}>
            {year}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
