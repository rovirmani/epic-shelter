import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    time: "00:00",
    latency: 145,
    throughput: 1200,
  },
  {
    time: "03:00",
    latency: 192,
    throughput: 1100,
  },
  {
    time: "06:00",
    latency: 127,
    throughput: 1500,
  },
  {
    time: "09:00",
    latency: 156,
    throughput: 1420,
  },
  {
    time: "12:00",
    latency: 168,
    throughput: 1380,
  },
  {
    time: "15:00",
    latency: 134,
    throughput: 1620,
  },
  {
    time: "18:00",
    latency: 164,
    throughput: 1440,
  },
  {
    time: "21:00",
    latency: 146,
    throughput: 1560,
  },
]

export function Chart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="time"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}ms`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Latency
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].value}ms
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Throughput
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[1].value}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="latency"
          stroke="#8b5cf6"
          strokeWidth={2}
          activeDot={{
            r: 4,
            style: { fill: "#8b5cf6" },
          }}
        />
        <Line
          type="monotone"
          dataKey="throughput"
          stroke="#22c55e"
          strokeWidth={2}
          activeDot={{
            r: 4,
            style: { fill: "#22c55e" },
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
