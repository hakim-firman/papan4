import { useRouter, useSearchParams } from "next/navigation";
import { t } from "@lingui/core/macro";
import { env } from "next-runtime-env";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@kan/auth/client";

import { useClickOutside } from "~/hooks/useClickOutside";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { useWorkspace, WorkspaceProvider } from "~/providers/workspace";
import { api } from "~/utils/api";
import { ChangePasswordFormConfirmation } from "~/views/settings/components/ChangePasswordConfirmation";
import Button from "./Button";
import Modal from "./modal";
import SideNavigation from "./SideNavigation";
import TopBar from "./TopBar";

interface DashboardProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  hasRightPanel?: boolean;
}

export function getDashboardLayout(
  page: React.ReactElement,
  rightPanel?: React.ReactNode,
  hasRightPanel = false,
) {
  return (
    <WorkspaceProvider>
      <Dashboard rightPanel={rightPanel} hasRightPanel={hasRightPanel}>
        {page}
      </Dashboard>
    </WorkspaceProvider>
  );
}

export default function Dashboard({
  children,
  rightPanel,
  hasRightPanel = false,
}: DashboardProps) {
  const { resolvedTheme } = useTheme();
  const { openModal, closeModal, modalContentType } = useModal();
  const { availableWorkspaces, hasLoaded } = useWorkspace();
  const { showPopup } = usePopup();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { data: user, isLoading: userLoading } = api.user.getUser.useQuery(
    undefined,
    {
      enabled: !!session?.user,
    },
  );

  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  // Desktop sidebar visibility (Trello-style: hidden by default, toggled from the top bar)
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const [isSideNavInit, setIsSideNavInit] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kan_sidebar_desktop_visible");
    if (saved !== null) setIsSideNavVisible(saved === "true");
    setIsSideNavInit(true);
  }, []);

  useEffect(() => {
    if (isSideNavInit) {
      localStorage.setItem(
        "kan_sidebar_desktop_visible",
        String(isSideNavVisible),
      );
    }
  }, [isSideNavVisible, isSideNavInit]);

  const sideNavRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const sideNavButtonRef = useRef<HTMLButtonElement>(null);
  const rightPanelButtonRef = useRef<HTMLButtonElement>(null);

  const toggleSideNav = () => {
    // Mobile uses the overlay (isSideNavOpen); desktop uses display (isSideNavVisible).
    setIsSideNavOpen(!isSideNavOpen);
    setIsSideNavVisible(!isSideNavVisible);
    if (!isSideNavOpen) {
      setIsRightPanelOpen(false);
    }
  };

  const closeSideNav = () => {
    setIsSideNavOpen(false);
  };

  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
    if (!isRightPanelOpen) {
      setIsSideNavOpen(false);
    }
  };

  useClickOutside(sideNavRef, (event) => {
    if (sideNavButtonRef.current?.contains(event.target as Node)) {
      return;
    }
    if (isSideNavOpen) {
      setIsSideNavOpen(false);
    }
  });

  useClickOutside(rightPanelRef, (event) => {
    if (rightPanelButtonRef.current?.contains(event.target as Node)) {
      return;
    }
    if (isRightPanelOpen) {
      setIsRightPanelOpen(false);
    }
  });

  useEffect(() => {
    const partnerActivated = searchParams.get("partner_activated");
    const partnerError = searchParams.get("partner_error");

    if (partnerActivated) {
      showPopup({
        header: t`License activated`,
        message: t`Your license has been activated successfully.`,
        icon: "success",
      });
      const params = new URLSearchParams(searchParams.toString());
      params.delete("partner_activated");
      router.replace(`?${params.toString()}`);
    } else if (partnerError) {
      const messages: Record<string, string> = {
        invalid_license: t`That license key could not be found. Please contact support.`,
        license_inactive: t`Your license is not active. Please check your account.`,
        missing_license: t`No license key was provided. Please try activating again.`,
      };
      showPopup({
        header: t`License activation failed`,
        message:
          messages[partnerError] ??
          t`Something went wrong during license activation.`,
        icon: "error",
      });
      const params = new URLSearchParams(searchParams.toString());
      params.delete("partner_error");
      router.replace(`?${params.toString()}`);
    }
  }, [searchParams, showPopup, router]);

  useEffect(() => {
    if (hasLoaded && availableWorkspaces.length === 0) {
      if (env("NEXT_PUBLIC_KAN_ENV") === "cloud") {
        router.push(
          `/onboarding/select-plan?returnUrl=${encodeURIComponent(window.location.pathname)}`,
        );
      } else {
        openModal("NEW_WORKSPACE", undefined, undefined, false);
      }
    }
  }, [hasLoaded, availableWorkspaces.length, openModal, router]);

  useEffect(() => {
    const isCredentialsEnabled =
      env("NEXT_PUBLIC_ALLOW_CREDENTIALS")?.toLowerCase() === "true";

    if (
      !userLoading &&
      user &&
      isCredentialsEnabled &&
      user.hasMagicLinkAccount &&
      !user.hasPassword &&
      !sessionStorage.getItem("set_password_prompted")
    ) {
      sessionStorage.setItem("set_password_prompted", "1");
      openModal("SET_PASSWORD_PROMPT");
    }
  }, [user, userLoading, openModal]);

  const isDarkMode = resolvedTheme === "dark";

  return (
    <>
      <style jsx global>{`
        html {
          height: 100vh;
          overflow: hidden;
          min-width: 320px;
          background-color: ${!isDarkMode ? "hsl(0deg 0% 97.3%)" : "#1c1c1c"};
        }
      `}</style>
      <div className="relative flex h-screen flex-col bg-light-100 dark:bg-dark-100">
        {/* Trello-style global top bar */}
        <TopBar
          user={{
            displayName: user?.name ?? session?.user.name,
            email: user?.email ?? session?.user.email ?? "",
            image: user?.image ?? undefined,
          }}
          isLoading={sessionLoading || userLoading}
          isSideNavOpen={isSideNavOpen}
          onToggleSideNav={toggleSideNav}
          sideNavButtonRef={sideNavButtonRef}
          hasRightPanel={hasRightPanel}
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={toggleRightPanel}
          rightPanelButtonRef={rightPanelButtonRef}
        />

        <div className="flex min-h-0 w-full flex-1">
          <div
            ref={sideNavRef}
            className={`fixed top-12 z-40 h-[calc(100dvh-3rem)] w-screen transform transition-transform duration-300 ease-in-out md:relative md:top-0 md:h-full md:w-auto md:translate-x-0 ${isSideNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${isSideNavVisible ? "md:block" : "md:hidden"} `}
          >
            <SideNavigation onCloseSideNav={closeSideNav} />
          </div>

          <div className="relative h-full min-h-0 w-full overflow-hidden">
            <div className="relative flex h-full min-h-0 w-full overflow-hidden">
              <div className="h-full w-full overflow-y-auto">{children}</div>

              {/* Mobile Right Panel */}
              {hasRightPanel && rightPanel && (
                <div
                  ref={rightPanelRef}
                  className={`fixed right-0 top-12 z-40 h-[calc(100dvh-3rem)] w-80 transform border-l border-light-300 bg-light-200 transition-transform duration-300 ease-in-out dark:border-dark-300 dark:bg-dark-100 md:hidden ${
                    isRightPanelOpen ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  <div className="h-full">{rightPanel}</div>
                </div>
              )}

              {/* Desktop Right Panel */}
              {hasRightPanel && rightPanel && (
                <div className="hidden md:block">{rightPanel}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        modalSize="sm"
        isVisible={modalContentType === "SET_PASSWORD_PROMPT"}
      >
        {user?.hasPassword ? (
          <div className="p-5">
            <h2 className="pb-4 text-base font-medium dark:text-white">{t`Password already set`}</h2>
            <p className="mb-6 text-sm text-light-900">
              {t`Your account already has a password. You can change it from your account settings.`}
            </p>
            <Button
              variant="secondary"
              onClick={closeModal}
              fullWidth
              size="lg"
            >
              {t`Close`}
            </Button>
          </div>
        ) : (
          <ChangePasswordFormConfirmation hasPassword={false} />
        )}
      </Modal>
    </>
  );
}
