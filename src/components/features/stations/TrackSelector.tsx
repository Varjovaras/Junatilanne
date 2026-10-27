import type { StationSchedule } from "@/lib/types/stationTypes";
import { useTranslations } from "@/lib/i18n/useTranslations";

interface TrackSelectorProps {
    schedules: StationSchedule[];
    stationId: string;
    selectedTrack: string | null;
    onTrackSelect: (track: string | null) => void;
}

const TrackSelector = ({
    schedules,
    stationId,
    selectedTrack,
    onTrackSelect,
}: TrackSelectorProps) => {
    const { translations } = useTranslations();
    const tracks = Array.from(
        new Set(
            schedules
                .map(
                    (schedule) =>
                        schedule.timeTableRows.find((row) => row.stationShortCode === stationId)
                            ?.commercialTrack,
                )
                .filter(
                    (track): track is string =>
                        track !== undefined && track !== null && track !== "",
                ),
        ),
    ).sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));

    const handleTrackChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        const track = value === "all" ? null : value;
        onTrackSelect(track);
    };

    return (
        <div className="flex justify-center">
            <select
                aria-label={translations.selectTrackAria}
                value={selectedTrack ?? "all"}
                onChange={handleTrackChange}
                className="px-4 py-2 rounded-md border border-border bg-surface hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="all">{translations.allTracks}</option>
                {tracks.map((track) => (
                    <option key={track} value={track}>
                        {translations.trackNumber.replace("{track}", track)}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TrackSelector;
