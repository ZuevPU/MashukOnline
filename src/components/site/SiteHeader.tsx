import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ButtonLink } from "@/components/ui/Button";
import { getSessionUser } from "@/lib/auth";
import { lmsConfigured } from "@/lib/lms-sso";

const NAV = [
  { href: "https://центрзнаниймашук.рф/", label: "О Центре", external: true },
  { href: "/#programs", label: "Программы" },
  { href: "/#support", label: "Поддержка" },
  { href: "https://lms.mashuk.online/", label: "Онлайн-курсы", external: true },
];

/** Соцсети Центра — MAX и VK (как на витрине mashuk.online). */
function Social() {
  return (
    <ul className="m-0 flex list-none items-center gap-2 p-0">
      <li>
        <a
          href="https://max.ru/czmashuk"
          target="_blank"
          rel="nofollow noopener"
          aria-label="MAX"
          className="flex h-8 w-8 text-navy transition-opacity duration-200 hover:opacity-70"
        >
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-8 w-8">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0ZM24.2314 12.5C17.8663 12.5 12.4942 17.4255 12.4941 23.9727C12.4941 26.714 13.0015 28.6059 13.4482 30.3047C13.8233 31.6836 14.1543 32.9467 14.1543 34.4414C14.3143 36.4326 17.9823 35.2685 19.1406 33.7793C20.9718 35.1031 22.0251 35.4346 24.292 35.4346C30.5586 35.4011 35.6151 30.2999 35.5938 24.0332C35.5937 17.6682 30.602 12.5 24.2314 12.5ZM24.3857 18.1592V18.165C27.5981 18.349 30.0709 21.0719 29.9453 24.2871C29.7296 27.4955 26.9854 29.9406 23.7734 29.7861C22.768 29.7055 21.8016 29.3614 20.9717 28.7881C20.4699 29.2899 19.6648 29.9402 19.3447 29.8633C18.6774 29.6868 17.8938 26.2951 18.335 23.5098C18.87 20.1452 21.2859 17.9993 24.3857 18.1592Z"
              fill="#223F9A"
            />
          </svg>
        </a>
      </li>
      <li>
        <a
          href="https://vk.com/czmashuk"
          target="_blank"
          rel="nofollow noopener"
          aria-label="VK"
          className="flex h-8 w-8 text-navy transition-opacity duration-200 hover:opacity-70"
        >
          <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className="h-8 w-8">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M50 100c27.614 0 50-22.386 50-50S77.614 0 50 0 0 22.386 0 50s22.386 50 50 50ZM25 34c.406 19.488 10.15 31.2 27.233 31.2h.968V54.05c6.278.625 11.024 5.216 12.93 11.15H75c-2.436-8.87-8.838-13.773-12.836-15.647C66.162 47.242 71.783 41.62 73.126 34h-8.058c-1.749 6.184-6.932 11.805-11.867 12.336V34h-8.057v21.611C40.147 54.362 33.838 48.304 33.556 34H25Z"
              fill="#223F9A"
            />
          </svg>
        </a>
      </li>
    </ul>
  );
}

export async function SiteHeader() {
  // «Кабинет» ведёт вошедшего в личный кабинет, а гостя — на вход
  const user = await getSessionUser();
  const action = { href: user ? "/cabinet" : "/join" };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-paper-warm/90 backdrop-blur-glass">
      <div className="wrap flex min-h-19 flex-wrap items-center gap-x-8 gap-y-2 py-2">
        <Link href="/" aria-label="На главную" className="flex shrink-0 items-center">
          <BrandLogo width={156} priority />
        </Link>

        <nav
          aria-label="Основная навигация"
          className="order-3 w-full text-meta sm:order-none sm:w-auto sm:ml-auto md:text-sm"
        >
          <ul className="m-0 flex list-none flex-wrap items-center gap-x-5 gap-y-1 p-0">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "nofollow noopener" : undefined}
                  className="no-underline transition-colors duration-200 hover:text-navy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          <span className="hidden md:flex">
            <Social />
          </span>
          {!user && lmsConfigured() ? (
            <a
              href="/api/auth/sso/lms/start"
              className="hidden text-meta font-semibold text-navy no-underline hover:underline sm:inline"
            >
              Войти через LMS
            </a>
          ) : null}
          <ButtonLink href={action.href} size="sm">
            Кабинет
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
