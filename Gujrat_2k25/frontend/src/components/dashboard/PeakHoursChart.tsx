import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface PeakHourData {
  hour: string;
  bookings: number;
  percentage: number;
}

interface PeakHoursChartProps {
  data: PeakHourData[];
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  console.log('PeakHoursChart received data:', data);
  
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  
  // Handle empty data
  if (safeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Peak Booking Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No booking data available</p>
            <p className="text-sm">Bookings will appear here once you have activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxPercentage = Math.max(...safeData.map(d => d.percentage));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Peak Booking Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {safeData.map((hour, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-sm font-medium w-16">{hour.hour}</span>
              <div className="flex-1 bg-muted rounded-full h-2 relative">
                <div 
                  className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${hour.percentage}%` }}
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full"
                  style={{ width: `${hour.percentage}%` }}
                />
              </div>
              <div className="text-right min-w-[60px]">
                <span className="text-sm font-medium text-primary">
                  {hour.bookings}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({hour.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Insights</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Peak hours: {data.length > 0 ? data.slice(0, 3).map(h => h.hour).join(', ') : 'No data'}</p>
            <p>• Total bookings: {(() => {
              try {
                return data.length > 0 ? data.reduce((sum, h) => sum + h.bookings, 0) : 0;
              } catch (error) {
                console.error('Error calculating total bookings:', error);
                return 0;
              }
            })()}</p>
            <p>• Busiest time: {(() => {
              try {
                return data.length > 0 ? data.reduce((max, h) => h.bookings > max.bookings ? h : max).hour : 'No data';
              } catch (error) {
                console.error('Error calculating busiest time:', error);
                return 'No data';
              }
            })()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 