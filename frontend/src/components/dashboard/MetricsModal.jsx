import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Chart } from "../ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function MetricsModal({ isOpen, onClose, migration }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Migration Performance Metrics
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156ms</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Throughput
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,420</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.8%</div>
                <p className="text-xs text-muted-foreground">
                  +0.2% from last week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
