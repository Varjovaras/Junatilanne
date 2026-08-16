import type { TimeTableRow, TrainType } from "@/lib/types/trainTypes";
import {
    getCommercialStations,
    getLatestVisitedStationName,
    getNextCommercialStation,
} from "@/lib/utils/trainStations";
import StationRow, { type StationStatus } from "./StationRow";

type TrainStationsProps = {
    train: TrainType;
    showAllStations: boolean;
    showNonCommercialStops?: boolean;
};

const TrainStations = ({ train, showAllStations, showNonCommercialStops }: TrainStationsProps) => {
    const passengerStationArrivals = showNonCommercialStops
        ? train.timeTableRows.filter((row) => row.type === "ARRIVAL")
        : getCommercialStations(train.timeTableRows, "ARRIVAL");

    const firstDeparture = showNonCommercialStops
        ? train.timeTableRows.find((row) => row.type === "DEPARTURE")
        : getCommercialStations(train.timeTableRows, "DEPARTURE")[0];

    if (!firstDeparture) {
        return null;
    }

    const currentStation = getLatestVisitedStationName(train);
    const nextStationRow = getNextCommercialStation(train);

    // Only include firstDeparture when showing all stations
    const stationsToShow = showAllStations
        ? [firstDeparture, ...passengerStationArrivals]
        : passengerStationArrivals.filter((station) => {
              // Check if this is either the current station (including departure station)
              const isCurrentStation =
                  station.station.name === currentStation ||
                  (station.station.name === firstDeparture.station.name &&
                      currentStation === firstDeparture.station.name);

              // Check if this is the next station
              const isNextStation = station.station.name === nextStationRow?.station.name;

              return isCurrentStation || isNextStation;
          });

    const currentStationIndex = stationsToShow.findIndex(
        (station) =>
            station.station.name === currentStation ||
            (station.station.name === firstDeparture.station.name &&
                currentStation === firstDeparture.station.name),
    );

    const getStationStatus = (station: TimeTableRow, index: number): StationStatus => {
        if (showAllStations && index === 0) return "departure";
        if (station.station.name === currentStation) return "current";
        if (station.station.name === nextStationRow?.station.name) return "next";
        return index > currentStationIndex ? "future" : "past";
    };

    return (
        <div className="my-4 space-y-2 w-full max-w-2xl mx-auto">
            {stationsToShow.map((station, index) => (
                <StationRow
                    key={station.scheduledTime.toString() + station.type}
                    station={station}
                    status={getStationStatus(station, index)}
                    isPassenger={station.trainStopping && station.commercialStop === true}
                />
            ))}
        </div>
    );
};

export default TrainStations;
