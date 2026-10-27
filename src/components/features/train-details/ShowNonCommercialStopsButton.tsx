import type { Dispatch, SetStateAction } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";

type ShowNonCommercialStopsButtonProps = {
    showNonCommercialStops: boolean;
    setShowNonCommercialStops: Dispatch<SetStateAction<boolean>>;
};

const ShowNonCommercialStopsButton = ({
    showNonCommercialStops,
    setShowNonCommercialStops,
}: ShowNonCommercialStopsButtonProps) => {
    const { translations } = useTranslations();

    return (
        <button
            type="button"
            onClick={() => setShowNonCommercialStops(!showNonCommercialStops)}
            className="p-2 m-2 text-sm border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
        >
            {showNonCommercialStops
                ? translations.showOnlyCommercialStops
                : translations.showAllStops}
        </button>
    );
};

export default ShowNonCommercialStopsButton;
