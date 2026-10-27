import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

type TrainChipProps = {
    icon: IconDefinition;
    children: ReactNode;
};

const TrainChip = ({ icon, children }: TrainChipProps) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-muted text-sm">
        <FontAwesomeIcon
            icon={icon}
            aria-hidden="true"
            className="h-3.5 w-3.5 text-foreground/60"
        />
        <span>{children}</span>
    </span>
);

export default TrainChip;
