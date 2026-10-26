import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useRef } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { StationSchedule } from "@/lib/types/stationTypes";
import { getTrainId } from "@/lib/utils/trainDisplay";
import ScheduleTableRow, { scheduleTableGridClass } from "./ScheduleTableRow";

type ScheduleTableProps = {
    schedules: StationSchedule[];
    stationId: string;
};

const ScheduleTable = ({ schedules, stationId }: ScheduleTableProps) => {
    const { translations } = useTranslations();
    const parentRef = useRef<HTMLDivElement>(null);

    const getItemKey = useCallback((index: number) => getTrainId(schedules[index]), [schedules]);

    const virtualizer = useVirtualizer({
        count: schedules.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 84,
        overscan: 8,
        gap: 0,
        getItemKey,
        initialRect: { width: 960, height: 800 },
    });

    return (
        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-surface">
            <div role="table" aria-label={translations.schedule}>
                <div role="rowgroup">
                    <div
                        role="row"
                        className={`${scheduleTableGridClass} border-b border-border bg-surface-muted px-3 py-2.5 text-xs uppercase tracking-wider text-foreground/60 md:px-4`}
                    >
                        <span role="columnheader">{translations.time}</span>
                        <span role="columnheader">{translations.train}</span>
                        <span role="columnheader" className="hidden md:block">
                            {translations.route}
                        </span>
                        <span role="columnheader" className="hidden md:block">
                            {translations.track}
                        </span>
                        <span role="columnheader" className="justify-self-end">
                            {translations.status}
                        </span>
                    </div>
                </div>

                <div
                    ref={parentRef}
                    role="rowgroup"
                    className="max-h-[70vh] overflow-y-auto overscroll-contain"
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
                                <ScheduleTableRow
                                    schedule={schedules[item.index]}
                                    stationId={stationId}
                                    index={item.index}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleTable;
