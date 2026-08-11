import { useLocation } from "@tanstack/react-router";
import type { TrainType } from "@/lib/types/trainTypes";
import TrainButton from "./TrainButton";
import TrainHomeView from "./TrainHomeView";
import TrainStationsView from "./TrainStationsView";

type TrainProps = {
    train: TrainType;
};

const Train = ({ train }: TrainProps) => {
    const pathname = useLocation({ select: (location) => location.pathname });
    const isTrainsRoute = pathname.startsWith("/trains/");

    return (
        <div
            key={`train-${train.trainNumber}`}
            className="border border-border bg-surface rounded-lg px-4 py-3 m-2 overflow-hidden wrap-break-word flex flex-col min-h-[200px]"
        >
            <TrainButton train={train} />
            <div className="flex-1 flex flex-col">
                {isTrainsRoute ? (
                    <TrainStationsView train={train} />
                ) : (
                    <TrainHomeView train={train} />
                )}
            </div>
        </div>
    );
};

export default Train;
