import { Clock } from "lucide-react";
import { motion } from "framer-motion";

export function HoursPreviewCard({ hours, timezone }) {
  const dayNames = {
    mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday"
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    let hours = parseInt(h);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${m} ${ampm}`;
  };

  return (
    <div className="sticky top-24">
      <div className="flex justify-between items-end mb-4">
        <h3 className="font-bold text-foreground">Timing Preview</h3>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{timezone}</span>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[2rem] border border-border p-6 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Weekly Schedule</h4>
            <p className="text-xs text-muted-foreground">This is how customers will see your timings on the app.</p>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(hours).map(([key, schedule]) => (
            <div key={key} className="flex justify-between items-start text-sm">
              <span className="font-medium text-foreground w-24">{dayNames[key]}</span>
              
              <div className="flex flex-col items-end gap-1 flex-1">
                {schedule.isClosed ? (
                  <span className="text-destructive font-bold text-xs uppercase tracking-wider bg-destructive/10 px-2 py-0.5 rounded-full">Closed</span>
                ) : (
                  <>
                    <span className="text-muted-foreground font-medium whitespace-nowrap">
                      {formatTime(schedule.open)} - {formatTime(schedule.close)}
                    </span>
                    {schedule.breaks?.map((b, i) => (
                      <span key={i} className="text-[10px] text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded flex items-center">
                        Break: {formatTime(b.start)} - {formatTime(b.end)}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
