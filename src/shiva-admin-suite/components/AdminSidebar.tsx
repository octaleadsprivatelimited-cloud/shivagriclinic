import { LayoutDashboard, LogOut, Video, ArrowUpRight, PanelsTopLeft, Users, Newspaper, BookOpen, FileText, Images } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "./NavLink";
import { isLocalChannelPreview } from "@/hooks/useChannelContent";
import { isFirebaseConfigured } from "@/lib/firebase";

const items = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Videos", url: "/admin/videos", icon: Video },
  { title: "Website content", url: "/admin/content", icon: PanelsTopLeft },
  { title: "Gallery", url: "/admin/gallery", icon: Images },
  { title: "Team", url: "/admin/team", icon: Users },
  { title: "Featured In", url: "/admin/featured-in", icon: Newspaper },
  { title: "Blog", url: "/admin/blog", icon: BookOpen },
  { title: "Case studies", url: "/admin/case-studies", icon: FileText },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary"><img src="/images/shiva-logo.png" alt="" className="h-9 w-9 object-contain" /></div>
          {!collapsed && <div><h2 className="text-sm font-bold text-sidebar-primary-foreground">Shiva Agri Clinic</h2><p className="text-xs text-sidebar-foreground/60">Channel studio</p></div>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">Channel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} tooltip={item.title}>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View website">
              <Link to="/"><ArrowUpRight className="h-4 w-4" />{!collapsed && <span>View website</span>}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {!(isLocalChannelPreview() && !isFirebaseConfigured()) && <SidebarMenuItem>
            <SidebarMenuButton type="button" tooltip="Sign out" onClick={() => void handleLogout()} className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent">
              <LogOut className="h-4 w-4" />{!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
