import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Card as TremorCard } from "@tremor/react";

interface Props {
  data: {
    date: string;
    "Successful Migrations": number;
    "Failed Migrations": number;
  }[];
}

export function MigrationChart({ data }: Props) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Migration Overview</CardTitle>
        <CardDescription>
          Migration success and failure trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TremorCard>
          <AreaChart
            className="h-72 mt-4"
            data={data}
            index="date"
            categories={["Successful Migrations", "Failed Migrations"]}
            colors={["emerald", "red"]}
            valueFormatter={(number: number) =>
              Intl.NumberFormat("us").format(number).toString()
            }
          />
        </TremorCard>
      </CardContent>
    </Card>
  );
}
