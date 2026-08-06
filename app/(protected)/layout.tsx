import AppNavbar from "@/components/ui/app-navbar";
import { getCurrentUser } from "@/app/actions/auth-actions";

export default async function protectedLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
    const user = await getCurrentUser();
    
    return (
        <div className="app-shell font-sans antialiased">
            <AppNavbar userFirstName={user?.profile?.first_name || undefined} />
            {children}
        </div>
    )
}
