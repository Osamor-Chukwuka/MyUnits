import AppNavbar from "@/components/ui/app-navbar";

export default function protectedLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className={`font-sans antialiased`}>
            <AppNavbar />
            {children}
        </div>
    )
}