import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "@/app/globals.css";
import favicon from "@/favicon.ico?url";
import geistMono from "@/app/fonts/GeistMonoVF.woff?url";
import ErrorPopup from "@/components/common/ErrorPopup";
import NotFoundComponent from "@/components/common/NotFoundComponent";
import RootErrorComponent from "@/components/common/RootErrorComponent";
import Footer from "@/components/layout/Footer";
import Title from "@/components/layout/Title";
import TopBar from "@/components/layout/TopBar";
import { ErrorProvider } from "@/components/providers/ErrorProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/useTranslations";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: "Junatilanne" },
            {
                name: "description",
                content: "Real-time Finnish train situation / Reaaliaikainen junatilanne",
            },
            { name: "style-src-elem", content: "self" },
        ],
        scripts: [
            {
                children:
                    'try{if(localStorage.getItem("theme")!=="light"){document.documentElement.classList.add("dark")}}catch(e){}',
            },
        ],
        links: [
            {
                rel: "icon",
                href: favicon,
            },
            {
                rel: "preload",
                href: geistMono,
                as: "font",
                type: "font/woff",
                crossOrigin: "anonymous",
            },
        ],
    }),
    errorComponent: RootErrorComponent,
    notFoundComponent: NotFoundComponent,
    component: RootLayout,
});

function RootLayout() {
    const { queryClient } = Route.useRouteContext();
    console.log("MOEEHH");

    return (
        <QueryClientProvider client={queryClient}>
            <html lang="en" suppressHydrationWarning>
                <head>
                    <HeadContent />
                    <script
                        defer
                        src="https://analytics.hcbull.com/script.js"
                        data-website-id="8818e217-ee71-4767-824b-b6155eb2a904"
                    />
                </head>
                <body className="antialiased min-h-screen">
                    <ThemeProvider>
                        <LanguageProvider>
                            <ErrorProvider>
                                <div className="font-(family-name:--font-geist-mono) min-h-screen flex flex-col">
                                    <TopBar />
                                    <div className="flex-1 py-20 px-4 mt-4 flex flex-col items-center max-w-7xl mx-auto w-full">
                                        <Title />
                                        <main className="flex-1 w-full">
                                            <Outlet />
                                        </main>
                                        <Footer />
                                    </div>
                                </div>
                                <ErrorPopup />
                            </ErrorProvider>
                        </LanguageProvider>
                    </ThemeProvider>
                    <Scripts />
                    <TanStackRouterDevtools />
                </body>
            </html>
        </QueryClientProvider>
    );
}
