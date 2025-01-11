import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Migration } from "@/types/migration"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Props {
  migrations: Migration[]
}

export function RecentMigrations({ migrations }: Props) {
  const getStatusColor = (status: Migration['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Migrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {migrations.slice(0, 5).map((migration) => (
            <div className="flex items-center" key={migration.id}>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {migration.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {migration.currentStep}
                </p>
              </div>
              <div className="ml-auto flex items-center space-x-4">
                <Badge
                  variant="secondary"
                  className={getStatusColor(migration.status)}
                >
                  {migration.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(migration.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
