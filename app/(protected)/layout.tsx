import AppNavbar from "@/components/ui/app-navbar";
import { supabaseServer } from "@/lib/supabase/server";

export default async function protectedLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    return (
        <div className={`font-sans antialiased`}>
            <AppNavbar userFirstName={user?.user_metadata?.first_name || undefined} />
            {children}
        </div>
    )
}