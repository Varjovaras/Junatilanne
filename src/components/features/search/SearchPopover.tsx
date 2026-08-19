import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Search from "@/components/features/search/Search";
import { useTranslations } from "@/lib/i18n/useTranslations";

const SearchPopover = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { translations } = useTranslations();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const locationHref = useRouterState({ select: (s) => s.location.href });

    useEffect(() => {
        if (!isOpen) return;

        const positionDialog = () => {
            const dialog = dialogRef.current;
            const button = buttonRef.current;
            if (!dialog || !button) return;
            const rect = button.getBoundingClientRect();
            const width = dialog.offsetWidth;
            const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
            dialog.style.left = `${left}px`;
            dialog.style.top = `${rect.bottom + 4}px`;
        };

        const handleClick = (e: MouseEvent) => {
            const dialog = dialogRef.current;
            if (dialog && e.target === dialog) {
                dialog.close();
            }
        };

        positionDialog();
        window.addEventListener("resize", positionDialog);
        document.addEventListener("click", handleClick);
        return () => {
            window.removeEventListener("resize", positionDialog);
            document.removeEventListener("click", handleClick);
        };
    }, [isOpen]);

    const toggleDialog = () => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (dialog.open) {
            dialog.close();
        } else {
            dialog.showModal();
            setIsOpen(true);
        }
    };

    return (
        <div>
            <button
                ref={buttonRef}
                type="button"
                onClick={toggleDialog}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                aria-label={translations.search}
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors"
            >
                <span className="hidden sm:inline">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        aria-hidden="true"
                        className="mr-1 h-3 w-3"
                    />
                    {translations.search}
                </span>
                <span className="sm:hidden">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        aria-hidden="true"
                        className="h-4 w-4"
                    />
                </span>
            </button>
            <dialog
                key={locationHref}
                ref={dialogRef}
                aria-label={translations.search}
                onClose={() => setIsOpen(false)}
                className="fixed m-0 w-[min(28rem,calc(100vw-1.5rem))] bg-surface text-foreground border border-border rounded-md shadow-lg backdrop:bg-transparent"
            >
                <Search />
            </dialog>
        </div>
    );
};

export default SearchPopover;
