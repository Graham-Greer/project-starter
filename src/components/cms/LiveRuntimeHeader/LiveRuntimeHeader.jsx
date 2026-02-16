"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { Icon } from "@/components/primitives";
import styles from "./live-runtime-header.module.css";

function isExternalHref(href = "") {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

function NavLink({ item, isActive, onNavigate }) {
  if (!item?.href) return null;
  const className = `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`.trim();
  if (isExternalHref(item.href)) {
    return (
      <a
        href={item.href}
        className={className}
        target={item.openInNewTab ? "_blank" : undefined}
        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
        onClick={onNavigate}
      >
        <span className={styles.navLinkLabel}>{item.label}</span>
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      <span className={styles.navLinkLabel}>{item.label}</span>
    </Link>
  );
}

function NavParentLink({ item, isActive, onNavigate, className = "" }) {
  if (!item?.href) return null;
  const nextClassName = `${styles.navParentLink} ${isActive ? styles.navLinkActive : ""} ${className}`.trim();
  if (isExternalHref(item.href)) {
    return (
      <a
        href={item.href}
        className={nextClassName}
        target={item.openInNewTab ? "_blank" : undefined}
        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
        onClick={onNavigate}
      >
        <span className={styles.navLinkLabel}>{item.label}</span>
        <Icon name="chevronDown" size="0.95rem" className={styles.navParentChevron} />
      </a>
    );
  }

  return (
    <Link href={item.href} className={nextClassName} onClick={onNavigate}>
      <span className={styles.navLinkLabel}>{item.label}</span>
      <Icon name="chevronDown" size="0.95rem" className={styles.navParentChevron} />
    </Link>
  );
}

function NavDesktopItem({ item, pathname, previewMode = false }) {
  const hasChildren = Array.isArray(item?.children) && item.children.length > 0;
  if (!hasChildren) {
    return <NavLink item={item} isActive={item.href === pathname} />;
  }

  return (
    <div className={`${styles.navGroup} ${previewMode ? styles.navGroupPreview : ""}`.trim()}>
      <NavParentLink item={item} isActive={item.href === pathname} />
      <div className={`${styles.navDropdown} ${previewMode ? styles.navDropdownPreview : ""}`.trim()}>
        {item.children.map((child) => {
          const hasGrandChildren = Array.isArray(child?.children) && child.children.length > 0;
          if (!hasGrandChildren) {
            return <NavLink key={`live-nav-child-${child.id}`} item={child} isActive={child.href === pathname} />;
          }
          return (
            <div key={`live-nav-child-group-${child.id}`} className={styles.navDropdownGroup}>
              <NavLink item={child} isActive={child.href === pathname} />
              <div className={styles.navDropdownSubList}>
                {child.children.map((grandchild) => (
                  <NavLink key={`live-nav-grandchild-${grandchild.id}`} item={grandchild} isActive={grandchild.href === pathname} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavMobileItem({ item, pathname, onNavigate, depth = 0 }) {
  const hasChildren = Array.isArray(item?.children) && item.children.length > 0;
  return (
    <div className={`${styles.mobileNavItem} ${depth > 0 ? styles.mobileNavItemNested : ""}`.trim()}>
      {hasChildren ? (
        <NavParentLink
          item={item}
          isActive={item.href === pathname}
          onNavigate={onNavigate}
          className={styles.mobileParentLink}
        />
      ) : (
        <NavLink item={item} isActive={item.href === pathname} onNavigate={onNavigate} />
      )}
      {hasChildren ? (
        <div className={styles.mobileNavChildren}>
          {item.children.map((child) => (
            <NavMobileItem
              key={`live-mobile-nav-child-${child.id}`}
              item={child}
              pathname={pathname}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function LiveRuntimeHeader({
  siteName = "Site",
  siteRootHref = "/",
  headerConfig = {},
  navigationItems = [],
  previewMode = false,
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const variant = headerConfig?.variant || "simple";
  const overlayMode = headerConfig?.overlayMode || "off";
  const isSticky = typeof headerConfig?.sticky === "boolean" ? headerConfig.sticky : true;
  const primaryAction = headerConfig?.primaryAction || null;
  const secondaryAction = headerConfig?.secondaryAction || null;
  const logo = headerConfig?.logo || null;

  const visibleNavItems = useMemo(
    () => (Array.isArray(navigationItems) ? navigationItems.filter((item) => item?.visible !== false) : []),
    [navigationItems]
  );

  return (
    <>
      <header
        className={`${styles.header} ${isSticky ? styles.sticky : ""} ${overlayMode === "auto" ? styles.overlay : ""}`.trim()}
      >
        <div className={styles.inner}>
          <Link href={siteRootHref} className={styles.logo}>
            {logo?.src ? (
              <NextImage
                src={logo.src}
                alt={logo.alt || `${siteName} logo`}
                width={160}
                height={40}
                unoptimized
                className={styles.logoImage}
              />
            ) : (
              siteName
            )}
          </Link>

          {variant !== "minimal" ? (
            <nav className={styles.desktopNav} aria-label="Site navigation">
              {visibleNavItems.map((item) => (
                <NavDesktopItem key={`live-nav-${item.id}`} item={item} pathname={pathname} previewMode={previewMode} />
              ))}
            </nav>
          ) : (
            <div />
          )}

          <div className={styles.actions}>
            {secondaryAction?.label && secondaryAction?.href ? (
              <Button href={secondaryAction.href} variant="secondary" tone="neutral">
                {secondaryAction.label}
              </Button>
            ) : null}
            {primaryAction?.label && primaryAction?.href ? (
              <Button href={primaryAction.href} variant="primary" tone="neutral">
                {primaryAction.label}
              </Button>
            ) : null}

            {!previewMode ? (
              <button
                type="button"
                className={styles.menuButton}
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <Icon name={isOpen ? "close" : "menu"} decorative={true} />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {isOpen && !previewMode ? (
        <div className={styles.mobileDrawer} role="dialog" aria-label="Navigation menu">
          <div className={styles.mobileDrawerInner}>
            <div className={styles.mobileDrawerHeader}>
              <span className={styles.mobileDrawerTitle}>Menu</span>
              <button type="button" className={styles.mobileCloseButton} onClick={() => setIsOpen(false)} aria-label="Close menu">
                <Icon name="close" decorative={true} />
              </button>
            </div>
            {variant !== "minimal" ? (
              <nav className={styles.mobileNav} aria-label="Mobile site navigation">
                {visibleNavItems.map((item) => (
                  <NavMobileItem
                    key={`live-mobile-nav-${item.id}`}
                    item={item}
                    pathname={pathname}
                    onNavigate={() => setIsOpen(false)}
                  />
                ))}
              </nav>
            ) : null}
            <div className={styles.mobileActions}>
              {secondaryAction?.label && secondaryAction?.href ? (
                <Button href={secondaryAction.href} variant="secondary" tone="neutral" onClick={() => setIsOpen(false)}>
                  {secondaryAction.label}
                </Button>
              ) : null}
              {primaryAction?.label && primaryAction?.href ? (
                <Button href={primaryAction.href} variant="primary" tone="neutral" onClick={() => setIsOpen(false)}>
                  {primaryAction.label}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
