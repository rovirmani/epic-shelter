import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "@radix-ui/react-icons"
import { MigrationMetrics } from "@/types/migration"

interface Props {
  metrics: MigrationMetrics
}

export function OverviewCards({ metrics }: Props) {
  const cards = [
    {
      title: "Total Migrations",
      value: metrics.totalMigrations,
      description: "All time migrations",
      icon: ArrowRightIcon,
    },
    {
      title: "Success Rate",
      value: `${((metrics.successfulMigrations / metrics.totalMigrations) * 100).toFixed(1)}%`,
      description: `${metrics.successfulMigrations} successful migrations`,
      icon: ArrowUpIcon,
      trend: "positive",
    },
    {
      title: "Failed Migrations",
      value: metrics.failedMigrations,
      description: "Requires attention",
      icon: ArrowDownIcon,
      trend: "negative",
    },
    {
      title: "Throughput",
      value: `${(metrics.averageThroughput).toLocaleString()}`,
      description: "Rows per second",
      icon: ArrowRightIcon,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={cn(
              "h-4 w-4",
              card.trend === "positive" && "text-green-500",
              card.trend === "negative" && "text-red-500"
            )} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
