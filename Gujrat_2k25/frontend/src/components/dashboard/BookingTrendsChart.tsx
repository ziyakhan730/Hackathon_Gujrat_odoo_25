import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { formatINR } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface BookingData {
  date: string;
  bookings: number;
  earnings: number;
}

interface BookingTrendsChartProps {
  data: BookingData[];
  period: string;
}

export function BookingTrendsChart({ data, period }: BookingTrendsChartProps) {
  // Handle empty or undefined data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Booking Trends ({period})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No booking trends available</p>
            <p className="text-sm">Trends will appear here once you have bookings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBookings = data.reduce((sum, d) => sum + (d.bookings || 0), 0);
  const totalEarnings = data.reduce((sum, d) => sum + (d.earnings || 0), 0);

  const chartData = data.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bookings: d.bookings,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Booking Trends ({period})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ChartContainer
            config={{ bookings: { label: "Bookings", color: "hsl(var(--primary))" } }}
            className="h-full"
          >
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-lg font-bold text-primary">{totalBookings}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-lg font-bold text-green-600">{formatINR(totalEarnings)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 