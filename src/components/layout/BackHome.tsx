import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { queryKeys } from "@/lib/queries/shared/queryKeys";

const BackHome = () => {
    const pathname = useLocation({ select: (location) => location.pathname });
    const queryClient = useQueryClient();

    const { translations } = useTranslations();

    const buttonText = pathname !== "/" ? translations.backHome : translations.refreshTrainData;
    const isHomePage = pathname === "/";
    const buttonTextMobile = isHomePage
        ? translations.refreshTrainDataMobile
        : translations.backHomeMobile;

    return (
        <Link
            type="button"
            to="/"
            // Keep the home filters when refreshing the data from the home page.
            search={isHomePage ? true : undefined}
            replace={isHomePage}
            onClick={() => {
                if (isHomePage) {
                    void queryClient.invalidateQueries({ queryKey: queryKeys.homeTrains });
                }
            }}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
        >
            <span className="hidden sm:inline">{buttonText}</span>
            <span className="sm:hidden text-[10px]">{buttonTextMobile}</span>
        </Link>
    );
};

export default BackHome;
