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
  languageLinks,
}: {
  siteName: string;
  menuLinks: NavigationLink[];
  accountLinks: NavigationLink[];
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
        {accountLinks.length > 0 ? (
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
