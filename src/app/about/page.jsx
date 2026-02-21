import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";
import AboutClient from "./AboutClient";

export const metadata = {
    title: "About",
    description: "Learn about our engineering excellence.",
};

export default async function AboutPage() {
    const supabase = await createServerSupabaseClient();
    let isAdmin = false;

    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isAdminEmail(user.email)) isAdmin = true;
    }

    let heroImage = null;
    if (supabase) {
        const { data } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'about_hero_image')
            .maybeSingle();

        if (data) heroImage = data.setting_value;
    }

    return <AboutClient initialImage={heroImage} isAdmin={isAdmin} />;
}
