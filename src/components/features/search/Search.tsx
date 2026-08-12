import { faTrain } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import DatePicker from "@/components/common/DatePicker";
import { useTranslations } from "@/lib/i18n/useTranslations";
import { formatDateForUrl, todayISOString } from "@/lib/utils/dateUtils";
import { majorStations, passengerStationCodes } from "@/lib/utils/majorStations";
import { handleSearchError, validateDate, validateTrainNumber } from "@/lib/utils/searchUtils";

const Search = () => {
    const navigate = useNavigate();
    const { translations, isLoading } = useTranslations();
    const [searchValue, setSearchValue] = useState("");
    const [date, setDate] = useState(() => todayISOString());
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const [error, setError] = useState("");
    const id = useId();

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const clearInput = () => {
        setSearchValue("");
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setError("");
    };

    const handleStationSelect = (code: string) => {
        clearInput();
        navigate({ to: `/stations/${code}` });
    };

    const handleTrainSubmit = () => {
        const trainError = validateTrainNumber(searchValue, translations);
        if (trainError) return handleSearchError(trainError, setError);

        const dateError = validateDate(date, translations);
        if (dateError) return handleSearchError(dateError, setError);

        const formattedDate = formatDateForUrl(date);
        navigate({ to: `/trains/${searchValue.trim()}-${formattedDate}` });
        clearInput();
        return true;
    };

    const inputLower = searchValue.toLowerCase();
    const exactMatch = Object.entries(majorStations).find(
        ([code, name]) => name.toLowerCase() === inputLower || code.toLowerCase() === inputLower,
    );

    const handleSubmit = () => {
        if (selectedIndex >= 0) {
            handleStationSelect(suggestions[selectedIndex][0]);
            return;
        }
        if (exactMatch) {
            handleStationSelect(exactMatch[0]);
            return;
        }
        if (suggestions.length > 0) {
            handleStationSelect(suggestions[0][0]);
            return;
        }
        handleTrainSubmit();
    };
    const matchingSuggestions =
        searchValue.length < 2
            ? []
            : Object.entries(majorStations).filter(
                  ([code, name]) =>
                      name.toLowerCase().includes(inputLower) ||
                      code.toLowerCase().includes(inputLower),
              );

    const suggestions = [
        ...matchingSuggestions.filter(([code]) => passengerStationCodes.has(code)),
        ...matchingSuggestions.filter(([code]) => !passengerStationCodes.has(code)),
    ].slice(0, 10);

    const handleInputChange = (value: string) => {
        setSearchValue(value);
        setSelectedIndex(-1);
        setShowSuggestions(true);
        setError("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
            return;
        }

        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
                break;

            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;

            case "Escape":
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    useEffect(() => {
        const checkPosition = () => {
            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                setDropUp(window.innerHeight - rect.bottom < 300);
            }
        };

        checkPosition();
        window.addEventListener("resize", checkPosition);
        return () => window.removeEventListener("resize", checkPosition);
    }, []);

    useEffect(() => {
        if (selectedIndex < 0 || !listRef.current) return;
        const item = listRef.current.children[selectedIndex] as HTMLElement | undefined;
        item?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className={`p-4 space-y-4 w-full max-w-md relative ${isLoading ? "fade-out" : "fade-in"}`}
        >
            <div className="space-y-2 relative z-50">
                <label htmlFor={id} className="text-sm font-medium">
                    {translations.selectStation}
                </label>

                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={searchValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={translations.searchTrainOrStation}
                    className="w-full px-4 py-2 border border-foreground rounded-md
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              bg-surface text-foreground"
                />

                {showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={listRef}
                        className={`absolute z-10 w-full bg-surface border
              border-border rounded-md shadow-lg overflow-y-auto
              ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}`}
                        style={{ maxHeight: "300px" }}
                    >
                        {suggestions.map(([code, name], index) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => handleStationSelect(code)}
                                className={`w-full px-4 py-2 text-left hover:bg-surface-hover
                  flex justify-between items-center
                  ${index === selectedIndex ? "bg-surface-hover" : ""}
                  ${passengerStationCodes.has(code) ? "" : "opacity-60"}`}
                            >
                                <span className="flex items-center gap-2">
                                    {passengerStationCodes.has(code) && (
                                        <FontAwesomeIcon
                                            icon={faTrain}
                                            aria-hidden="true"
                                            className="h-4 w-4 shrink-0 text-foreground/70"
                                        />
                                    )}
                                    <span>{name}</span>
                                </span>
                                <span className="text-foreground/60 text-sm">{code}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <DatePicker date={date} setDate={setDate} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="button"
                onClick={handleSubmit}
                className="w-full px-4 py-2 text-sm border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!searchValue.trim() || !date}
            >
                {translations.findTrain}
            </button>
        </form>
    );
};

export default Search;
