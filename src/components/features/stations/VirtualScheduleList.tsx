import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useRef } from "react";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { getTrainId } from "@/lib/utils/trainDisplay";
import ScheduleRow from "./ScheduleRow";

type VirtualScheduleListProps = {
    schedules: StationSchedule[];
    stationId: string;
};

const VirtualScheduleList = ({ schedules, stationId }: VirtualScheduleListProps) => {
    const parentRef = useRef<HTMLDivElement>(null);

    const getItemKey = useCallback((index: number) => getTrainId(schedules[index]), [schedules]);

    const virtualizer = useVirtualizer({
        count: schedules.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 140,
        overscan: 6,
        gap: 8,
        getItemKey,
        initialRect: { width: 800, height: 800 },
    });

    return (
        <div
            ref={parentRef}
            className="mx-auto h-[70vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-background p-2"
        >
            <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map((item) => (
                    <div
                        key={item.key}
                        data-index={item.index}
                        ref={virtualizer.measureElement}
                        className="absolute top-0 left-0 w-full"
                        style={{ transform: `translateY(${item.start}px)` }}
                    >
                        <ScheduleRow schedule={schedules[item.index]} stationId={stationId} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VirtualScheduleList;
