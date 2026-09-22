/**
 * One appearance object for every Clerk surface — sign-in, sign-up, the avatar
 * popup and the UserProfile panel in dashboard settings. Set once on
 * <ClerkProvider> so nothing renders in Clerk's default light theme.
 *
 * Built from `variables` + `elements` only, with no `@clerk/themes` dependency.
 * That package's `dark` baseTheme is a convenience wrapper that mostly sets the
 * same variables declared below — not worth a second Clerk package whose
 * version has to be kept in step with the SDK.
 *
 * Typed structurally rather than importing `Appearance` from `@clerk/types`,
 * which isn't a direct dependency here.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#ededed",
    colorBackground: "#0a0a0a",
    colorInputBackground: "#000000",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextOnPrimaryBackground: "#000000",
    colorTextSecondary: "rgba(255,255,255,0.55)",
    colorNeutral: "#ffffff",
    colorDanger: "#f87171",
    colorSuccess: "#4ade80",
    // inherits the Manrope variable set on <body>
    fontFamily: "var(--font-manrope)",
    borderRadius: "6px",
  },
  elements: {
    cardBox: "border border-white/10 shadow-2xl shadow-black/60",
    card: "bg-[#0a0a0a]",
    headerTitle: "text-white",
    headerSubtitle: "text-white/55",

    socialButtonsBlockButton:
      "border border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.08] transition",
    socialButtonsBlockButtonText: "text-white",

    formButtonPrimary:
      "bg-[#ededed] text-black hover:bg-white normal-case font-medium shadow-none",
    formFieldInput: "bg-black border-white/12 text-white",
    formFieldLabel: "text-white/70",

    dividerLine: "bg-white/10",
    dividerText: "text-white/40",

    footer: "bg-transparent",
    footerActionText: "text-white/55",
    footerActionLink: "text-white hover:text-white",

    // the settings panel — Clerk's nav rail and content area both sit on a
    // light surface by default
    navbar: "bg-[#0a0a0a] border-r border-white/10",
    navbarButton: "text-white/60 hover:text-white",
    scrollBox: "bg-[#0a0a0a]",
    pageScrollBox: "bg-[#0a0a0a]",
    profileSectionTitleText: "text-white",
    accordionTriggerButton: "text-white/80 hover:text-white",

    menuList: "bg-[#0a0a0a] border border-white/10",
    menuItem: "text-white/70 hover:bg-white/[0.06] hover:text-white",
    userButtonPopoverCard:
      "bg-[#0a0a0a] border border-white/10 shadow-2xl shadow-black/60",
    userButtonPopoverActionButton:
      "text-white/70 hover:bg-white/[0.06] hover:text-white",
    userButtonPopoverFooter: "hidden",
  },
}
