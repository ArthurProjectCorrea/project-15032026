import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  Package,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

export const sidebarData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Materiais",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Estoque",
          url: "/admin/materials/inventory",
        },
        {
          title: "Análise Financeira",
          url: "/admin/materials/analytics",
        },
      ],
    },
    {
      title: "Plataforma",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
  ],
}
