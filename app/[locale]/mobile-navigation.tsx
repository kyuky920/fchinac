"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type NavigationLink = {
  href: string;
  label: string;
};

type LanguageLink = NavigationLink & {
  flagEmoji: string;
};

export function MobileNavigation({
  siteName,
  menuLinks,
  accountLinks,
  signedInUser,
  signedInLabel,
  logoutLabel,
  adminLink,
  logoutAction,
  languageLinks,
}: {
  siteName: string;
  menuLinks: NavigationLink[];
  accountLinks: NavigationLink[];
  signedInUser?: string;
  signedInLabel: string;
  logoutLabel: string;
  adminLink?: NavigationLink;
  logoutAction?: () => Promise<void>;
  languageLinks: LanguageLink[];
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  return (
    <details className="legacy-mobile-menu" ref={detailsRef}>
      <summary>
        <Image src="/legacy/images/icon_menu.png" alt="Menu" width={21} height={18} />
      </summary>
      <div className="legacy-mobile-drawer">
        <strong>{siteName}</strong>
        {menuLinks.map((item) => (
          <Link href={item.href} key={item.href} onClick={closeMenu}>{item.label}</Link>
        ))}
        {adminLink ? <Link className="legacy-mobile-admin-link" href={adminLink.href} onClick={closeMenu}><span aria-hidden="true">⚙</span>{adminLink.label}</Link> : null}
        {signedInUser && logoutAction ? (
          <div className="legacy-mobile-session-card">
            <div className="legacy-mobile-session-user">
              <span className="legacy-session-dot" aria-hidden="true" />
              <span><strong>{signedInUser}</strong><small>{signedInLabel}</small></span>
            </div>
            <div className="legacy-mobile-session-actions">
              <form action={logoutAction}><button type="submit">{logoutLabel}</button></form>
            </div>
          </div>
        ) : accountLinks.length > 0 ? (
          <div className="legacy-mobile-account">
            {accountLinks.map((item) => (
              <Link href={item.href} key={item.href} onClick={closeMenu}>{item.label}</Link>
            ))}
          </div>
        ) : null}
        <div className="legacy-mobile-languages">
          {languageLinks.map((item) => (
            <Link href={item.href} key={item.href} onClick={closeMenu}>
              {item.flagEmoji} {item.label}
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
