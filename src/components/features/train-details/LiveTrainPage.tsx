import { Link } from "@tanstack/react-router";
import TrainHeader from "@/components/features/train-details/TrainHeader";
import type { TrainType } from "@/lib/types/trainTypes";
import Train from "./Train";
import TrainStatusBoxes from "./TrainStatusBoxes";

type LiveTrainPageProps = {
    train: TrainType;
};

const LiveTrainPage = ({ train }: LiveTrainPageProps) => {
    return (
        <div className="mx-auto flex flex-col items-center max-w-6xl px-4">
            <div className="w-full flex flex-col items-center gap-4 mb-8">
                <TrainHeader train={train} />
                <Link
                    to="/map"
                    search={{ train: String(train.trainNumber) }}
                    className="px-6 py-3 border border-foreground bg-foreground text-background hover:bg-surface hover:text-foreground rounded-md transition-colors text-lg font-medium flex items-center gap-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    View on Map
                </Link>
                <div className="w-full">
                    <TrainStatusBoxes train={train} />
                </div>
            </div>
            <div className="w-full">
                <Train train={train} />
            </div>
        </div>
    );
};

export default LiveTrainPage;
