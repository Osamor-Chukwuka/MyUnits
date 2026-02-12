import AppNavbar from "@/components/ui/app-navbar";

export default function protectedLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`font-sans antialiased`}>
                <AppNavbar />
                {children}
            </body>
        </html>
    )
}