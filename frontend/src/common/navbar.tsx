'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';

import { signOut } from '@/api/auth';
import { useAppContext } from '@/common/context';
import SelectLanguage from '@/common/select-language';
import Avatar from '@/design-system/components/avatar';
import { Title } from '@/design-system/components/title';
import { Button } from '@/design-system/ui/button';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/design-system/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/ui/dropdown-menu';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';

import SelectBingo from './select-bingo';

const SITE_LINKS = [
  {
    label: 'links.home',
    href: '/',
  },
] as const;

type NavbarProps = {
  mode: 'app' | 'site';
};

export default function Navbar({ mode }: NavbarProps) {
  const { user, refreshUser } = useAppContext();
  const router = useRouter();
  const t = useTranslations('common.navbar');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClickSignOut = async () => {
    await signOut();

    router.push('/sign-in');
    refreshUser();
  };

  return (
    <div className="z-10 flex items-center justify-between backdrop-blur-sm px-4 py-2 border-b border-border">
      <div className="flex items-center gap-2">
        {mode === 'site' && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger className="md:hidden">
              <Menu size={24} />
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-6 md:hidden">
              <div className="flex items-center justify-between">
                <DrawerTitle asChild>
                  <Title.Ternary>{t('title')}</Title.Ternary>
                </DrawerTitle>
                {!user && <SelectLanguage />}
              </div>
              <div className="flex flex-col gap-6 my-6">
                {SITE_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="font-semibold" onClick={() => setDrawerOpen(false)}>
                    {t(link.label)}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {user ? (
                  <Link href="/dashboard">
                    <Button variant="default" size="sm" onClick={() => setDrawerOpen(false)}>
                      {t('buttons.dashboard')}
                    </Button>
                  </Link>
                ) : (
                  <Fragment>
                    <Button variant="default" onClick={() => router.push('/sign-up')}>
                      {t('buttons.signUp')}
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/sign-in')}>
                      {t('buttons.signIn')}
                    </Button>
                  </Fragment>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        )}
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Image src="/images/logo.webp" alt="RuneBingo logo" width={48} height={48} />
        </Link>
        {mode === 'site' && (
          <div className="hidden md:flex items-center gap-2">
            {SITE_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-semibold">
                {t(link.label)}
              </Link>
            ))}
          </div>
        )}
        {mode === 'app' && user?.hasBingos && (
          <div className="hidden md:block">
            <SelectBingo />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <Fragment>
            {mode === 'site' && (
              <Link href="/dashboard">
                <Button variant="default" size="sm" className="hidden md:block">
                  {t('buttons.dashboard')}
                </Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar user={user} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4">
                <DropdownMenuItem onClick={() => router.push('/my/account')}>
                  {t('userDropdown.myAccount')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>{t('userDropdown.myInvitations')}</DropdownMenuItem>
                <DropdownMenuItem disabled>{t('userDropdown.myApplications')}</DropdownMenuItem>
                <DropdownMenuItem disabled>{t('userDropdown.myRequests')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClickSignOut}>{t('userDropdown.signOut')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Fragment>
        ) : (
          <div className="hidden md:flex gap-3">
            <SelectLanguage />
            <Button variant="default" onClick={() => router.push('/sign-up')}>
              {t('buttons.signUp')}
            </Button>
            <Button variant="outline" onClick={() => router.push('/sign-in')}>
              {t('buttons.signIn')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
