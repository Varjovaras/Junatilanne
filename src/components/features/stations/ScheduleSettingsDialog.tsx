import { useEffect, useRef, type ReactNode, type RefObject } from "react";

type ScheduleSettingsDialogProps = {
    open: boolean;
    anchorRef: RefObject<HTMLButtonElement | null>;
    ariaLabel: string;
    onClose: () => void;
    children: ReactNode;
};

const ScheduleSettingsDialog = ({
    open,
    anchorRef,
    ariaLabel,
    onClose,
    children,
}: ScheduleSettingsDialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const positionDialog = () => {
            const dialog = dialogRef.current;
            const anchor = anchorRef.current;
            if (!dialog || !anchor) return;

            const rect = anchor.getBoundingClientRect();
            const width = dialog.offsetWidth;
            const left = Math.max(
                8,
                Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 8),
            );
            dialog.style.left = `${left}px`;
            dialog.style.top = `${rect.bottom + 4}px`;
        };

        const handleClick = (event: MouseEvent) => {
            const dialog = dialogRef.current;
            if (!dialog || event.target !== dialog) return;

            const rect = dialog.getBoundingClientRect();
            const isInsideDialog =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;

            if (!isInsideDialog) {
                onClose();
            }
        };

        positionDialog();
        window.addEventListener("resize", positionDialog);
        window.addEventListener("scroll", positionDialog, true);
        document.addEventListener("click", handleClick);
        return () => {
            window.removeEventListener("resize", positionDialog);
            window.removeEventListener("scroll", positionDialog, true);
            document.removeEventListener("click", handleClick);
        };
    }, [open, anchorRef, onClose]);

    return (
        <dialog
            ref={dialogRef}
            aria-label={ariaLabel}
            onClose={onClose}
            className="fixed m-0 w-[min(24rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-1rem)] overflow-y-auto bg-surface text-foreground border border-border rounded-md shadow-lg backdrop:bg-transparent"
        >
            <div className="space-y-4 p-4">{children}</div>
        </dialog>
    );
};

export default ScheduleSettingsDialog;
