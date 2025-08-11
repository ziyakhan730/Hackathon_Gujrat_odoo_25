import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

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
  const maxBookings = Math.max(...data.map(d => d.bookings));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Booking Trends ({period})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {data.map((day, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div 
                className="w-8 bg-primary rounded-t transition-all hover:bg-primary/80"
                style={{ 
                  height: `${(day.bookings / maxBookings) * 200}px`,
                  minHeight: '20px'
                }}
                title={`${day.bookings} bookings on ${new Date(day.date).toLocaleDateString()}`}
              />
              <span className="text-xs text-muted-foreground">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs font-medium text-primary">
                {day.bookings}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-lg font-bold text-primary">
              {data.reduce((sum, day) => sum + day.bookings, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-lg font-bold text-green-600">
              ₹{data.reduce((sum, day) => sum + day.earnings, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 