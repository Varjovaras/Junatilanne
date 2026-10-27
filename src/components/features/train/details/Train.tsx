import type { TrainType } from "@/lib/types/trainTypes";
import TrainStationsView from "../stations/TrainStationsView";

type TrainProps = {
    train: TrainType;
};

const Train = ({ train }: TrainProps) => {
    return (
        <div className="border border-border bg-surface rounded-lg px-4 py-3 m-2 overflow-hidden wrap-break-word flex flex-col min-h-[200px] w-full max-w-2xl mx-auto">
            <div className="flex-1 flex flex-col">
                <TrainStationsView train={train} />
            </div>
        </div>
    );
};

export default Train;
