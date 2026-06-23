import Link from "next/link";
import { t } from "@lingui/core/macro";
import {
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineQuestionMarkCircle,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarLeftExpand,
  TbLayoutSidebarRightCollapse,
  TbLayoutSidebarRightExpand,
} from "react-icons/tb";

import ThemeToggle from "~/components/ThemeToggle";
import UserMenu from "~/components/UserMenu";

interface TopBarProps {
  user: {
    displayName?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  };
  isLoading: boolean;
  isSideNavOpen: boolean;
  onToggleSideNav: () => void;
  sideNavButtonRef?: React.RefObject<HTMLButtonElement>;
  hasRightPanel?: boolean;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
  rightPanelButtonRef?: React.RefObject<HTMLButtonElement>;
}

export default function TopBar({
  user,
  isLoading,
  isSideNavOpen,
  onToggleSideNav,
  sideNavButtonRef,
  hasRightPanel = false,
  isRightPanelOpen = false,
  onToggleRightPanel,
  rightPanelButtonRef,
}: TopBarProps) {
  return (
    <header className="z-50 flex h-12 w-full flex-shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-trello-nav px-2 text-white shadow-[0_1px_0_rgba(0,0,0,0.4)]">
      {/* Left: sidebar toggle (mobile) + app switcher + logo */}
      <div className="flex items-center gap-1">
        <button
          ref={sideNavButtonRef}
          onClick={onToggleSideNav}
          className="rounded p-1.5 text-white/90 transition-all hover:bg-white/10"
          aria-label={t`Toggle sidebar`}
        >
          {isSideNavOpen ? (
            <TbLayoutSidebarLeftCollapse size={20} />
          ) : (
            <TbLayoutSidebarLeftExpand size={20} />
          )}
        </button>
        <button
          className="hidden rounded p-1.5 text-white/90 transition-all hover:bg-white/10 md:inline-flex"
          aria-label={t`Apps`}
        >
          <HiOutlineSquares2X2 className="h-5 w-5" />
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/10"
        >
          <span className="text-[16px] font-bold tracking-tight text-white">
            Kan
          </span>
        </Link>
      </div>

      {/* Center: search + create */}
      <div className="flex flex-1 items-center justify-center gap-2">
        <div className="relative hidden w-full max-w-[620px] sm:block">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder={t`Search`}
            className="h-8 w-full rounded border border-white/20 bg-white/10 pl-8 pr-3 text-sm text-white placeholder-white/60 focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-0"
          />
        </div>
        <Link
          href="/boards"
          className="flex h-8 items-center gap-1 rounded bg-trello-label-blue px-3 text-sm font-medium text-[#1D2125] transition-colors hover:bg-[#85B8FF]"
        >
          <HiOutlinePlus className="h-4 w-4" />
          <span className="hidden md:inline">{t`Create`}</span>
        </Link>
      </div>

      {/* Right: bell, help, theme, profile */}
      <div className="flex items-center gap-0.5 [&_button]:text-white/90">
        <button
          className="hidden rounded-full p-1.5 transition-all hover:bg-white/10 md:inline-flex"
          aria-label={t`Notifications`}
        >
          <HiOutlineBell className="h-5 w-5" />
        </button>
        <button
          className="hidden rounded-full p-1.5 transition-all hover:bg-white/10 md:inline-flex"
          aria-label={t`Help`}
        >
          <HiOutlineQuestionMarkCircle className="h-5 w-5" />
        </button>
        <ThemeToggle />
        <UserMenu
          displayName={user.displayName ?? undefined}
          email={user.email ?? "Email not provided?"}
          imageUrl={user.image ?? undefined}
          isLoading={isLoading}
          isCollapsed
        />
        {hasRightPanel && (
          <button
            ref={rightPanelButtonRef}
            onClick={onToggleRightPanel}
            className="rounded p-1.5 text-white/90 transition-all hover:bg-white/10 md:hidden"
            aria-label={t`Toggle panel`}
          >
            {isRightPanelOpen ? (
              <TbLayoutSidebarRightCollapse size={20} />
            ) : (
              <TbLayoutSidebarRightExpand size={20} />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
