import {
  AppWindow,
  Bot,
  CalendarCheck,
  CreditCard,
  Database,
  Globe,
  KeyRound,
  LayoutDashboard,
  Mail,
  Palette,
  Plug,
  Rocket,
  Server,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export const CONTACT_URL = "https://calendly.com/shaiksameer8921/meet-zepa-s-team"

export type Service = {
  title: string
  description: string
  icon: LucideIcon
  group: ServiceGroup
  includes: string[]
}

export type ServiceGroup = "Design" | "Product" | "Backend" | "Commerce" | "Integrations" | "Launch"

export const SERVICE_GROUPS: ServiceGroup[] = ["Design", "Product", "Backend", "Commerce", "Integrations", "Launch"]

export const SERVICES: Service[] = [
  { title: "UI/UX Design", description: "Premium designs, animations, 3D, WebGL and GSAP motion.", icon: Palette, group: "Design", includes: ["Wireframes & high-fidelity UI", "Motion, GSAP & WebGL moments", "Design system & components"] },
  { title: "Business Websites", description: "Company websites, landing pages and portfolios.", icon: Globe, group: "Design", includes: ["Company & product pages", "Landing pages built to convert", "SEO-ready, CMS optional"] },
  { title: "Web Applications", description: "SaaS products, custom platforms and business tools.", icon: AppWindow, group: "Product", includes: ["SaaS & customer portals", "Internal business tools", "Multi-role product flows"] },
  { title: "Authentication", description: "Signup, login, Google login, email verification and roles.", icon: KeyRound, group: "Backend", includes: ["Email, password & Google login", "Email verification & resets", "Roles and permissions"] },
  { title: "Backend Development", description: "APIs, business logic and server-side functionality.", icon: Server, group: "Backend", includes: ["REST / server APIs", "Business logic & workflows", "Background jobs & webhooks"] },
  { title: "Database Development", description: "User data, products, orders and business records.", icon: Database, group: "Backend", includes: ["Schema & data modelling", "Migrations & seed data", "Backups & query performance"] },
  { title: "Payment Integration", description: "Online payments, subscriptions and checkout.", icon: CreditCard, group: "Commerce", includes: ["Checkout & one-time payments", "Subscriptions & invoices", "Payment status & webhooks"] },
  { title: "Admin Dashboards", description: "Analytics, user management and reports.", icon: LayoutDashboard, group: "Product", includes: ["Analytics & KPIs", "User & content management", "Reports and exports"] },
  { title: "E-commerce", description: "Online stores, carts, inventory and order management.", icon: ShoppingCart, group: "Commerce", includes: ["Catalog, cart & checkout", "Inventory & orders", "Order emails & tracking"] },
  { title: "Booking Systems", description: "Appointments, reservations and scheduling.", icon: CalendarCheck, group: "Product", includes: ["Availability & time slots", "Reservations & reminders", "Staff / admin calendar"] },
  { title: "AI Integration", description: "AI chatbots, AI tools and automated workflows.", icon: Bot, group: "Integrations", includes: ["AI chat assistants", "Document & data tools", "Automated AI workflows"] },
  { title: "API Integrations", description: "Maps, WhatsApp, CRM and third-party services.", icon: Plug, group: "Integrations", includes: ["Maps & location", "WhatsApp & messaging", "CRM and third-party APIs"] },
  { title: "Email & Notifications", description: "OTPs, welcome emails, alerts and receipts.", icon: Mail, group: "Integrations", includes: ["OTP & verification emails", "Welcome & lifecycle emails", "Receipts and alerts"] },
  { title: "Responsive Applications", description: "Mobile-friendly websites and web apps on every screen.", icon: Smartphone, group: "Design", includes: ["Mobile-first layouts", "Tablet & desktop polish", "Installable PWA option"] },
  { title: "Deployment & Hosting", description: "Domains, hosting, SSL and production deployment.", icon: Rocket, group: "Launch", includes: ["Domain & DNS setup", "SSL & environments", "Production deployment"] },
  { title: "Security", description: "Access control, validation and rate limiting.", icon: ShieldCheck, group: "Launch", includes: ["Input validation", "Access control", "Rate limiting & abuse protection"] },
  { title: "Maintenance & Support", description: "Bug fixes, updates and new features after launch.", icon: Wrench, group: "Launch", includes: ["Bug fixes & updates", "Monitoring & improvements", "New features over time"] },
]

export const PIPELINE = [
  "Design",
  "Frontend",
  "Backend",
  "Database",
  "Auth",
  "Payments",
  "Deployment",
  "Maintenance",
] as const

export const STACK: { layer: string; text: string; tools: string[] }[] = [
  { layer: "Frontend", text: "Fast, accessible interfaces built as typed, reusable components.", tools: ["React", "Next.js", "TypeScript"] },
  { layer: "Design & Motion", text: "The same design system and motion craft behind Zepa UI — GSAP, WebGL and 3D where it earns its place.", tools: ["Tailwind CSS", "shadcn/ui", "GSAP", "Three.js"] },
  { layer: "Backend", text: "APIs and business logic that stay simple to extend as your product grows.", tools: ["Next.js API routes", "Node.js"] },
  { layer: "Database", text: "Relational data modelled around your business — users, orders, bookings, records.", tools: ["PostgreSQL", "Neon", "Supabase"] },
  { layer: "Authentication", text: "Secure sign-in, social login, email verification and role-based access.", tools: ["Clerk", "Auth.js"] },
  { layer: "Payments", text: "One-time payments, subscriptions and invoices with reliable status handling.", tools: ["Razorpay", "Stripe"] },
  { layer: "AI", text: "Assistants, document tools and automated workflows wired into your product.", tools: ["OpenAI API", "Anthropic API"] },
  { layer: "Deployment", text: "Domains, SSL, environments and production hosting configured for you.", tools: ["Vercel", "Netlify"] },
  { layer: "Integrations", text: "Email, maps, CRM, WhatsApp and the third-party APIs your business runs on.", tools: ["Email services", "Maps", "External APIs"] },
]

export const PROCESS = [
  { title: "Discovery", text: "We learn your business, requirements and budget." },
  { title: "Planning", text: "Features, milestones and the technology stack are defined and agreed." },
  { title: "Design", text: "UI/UX is designed and the visual direction signed off before code." },
  { title: "Development", text: "Frontend, backend, database and integrations are built in milestones." },
  { title: "Testing", text: "Functionality, responsiveness, permissions and critical flows are verified." },
  { title: "Launch", text: "The product is deployed and the production environment configured." },
  { title: "Support", text: "Ongoing maintenance and improvements under your support agreement." },
]

export const PLANS = [
  {
    name: "Launch",
    fit: "Business websites and landing pages",
    points: ["Custom design & motion", "Responsive build", "SEO-ready pages", "Domain, hosting & SSL setup"],
  },
  {
    name: "Business",
    fit: "Websites with a backend, accounts or dashboards",
    points: ["Everything in Launch", "Authentication & roles", "Database & APIs", "Admin dashboard & integrations"],
    featured: true,
  },
  {
    name: "Custom Product",
    fit: "SaaS, complex workflows and multi-role platforms",
    points: ["Product & architecture planning", "Payments & subscriptions", "AI and third-party integrations", "Milestone delivery & support"],
  },
]

export const AGREEMENTS = ["Project scope", "Delivery milestones", "Code ownership", "Hosting", "Support plan"]

export const SAMPLE_BUILDS = [
  {
    id: "ZE-104",
    name: "E-commerce store",
    now: "Building checkout & payments",
    progress: 72,
    done: ["Product catalog", "Customer accounts"],
    queue: ["Order emails", "Production deploy"],
  },
  {
    id: "ZE-117",
    name: "Clinic booking platform",
    now: "Wiring appointment scheduling",
    progress: 54,
    done: ["UI/UX design", "Patient login"],
    queue: ["Email & SMS reminders", "Admin dashboard"],
  },
  {
    id: "ZE-121",
    name: "SaaS analytics dashboard",
    now: "Connecting database & APIs",
    progress: 86,
    done: ["Design system", "Role-based access"],
    queue: ["Subscriptions", "Launch"],
  },
]
