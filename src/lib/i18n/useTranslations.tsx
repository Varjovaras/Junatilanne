import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { Language } from "./config";
import { translations } from "./translations";
import { useMounted } from "@/lib/utils/useMounted";

type TranslationContextValue = {
    translations: (typeof translations)[Language];
    currentLang: Language;
    isLoading: boolean;
};

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

const subscribe = () => () => {};

const getSnapshot = (): Language => {
    const savedLang = localStorage.getItem("preferredLanguage");
    return savedLang === "en" ? "en" : "fi";
};

const getServerSnapshot = (): Language => "fi";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const mounted = useMounted();
    const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    return (
        <TranslationContext.Provider
            value={{
                translations: translations[lang],
                currentLang: lang,
                isLoading: !mounted,
            }}
        >
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslations = () => {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error("useTranslations must be used within a LanguageProvider");
    }
    return context;
};
