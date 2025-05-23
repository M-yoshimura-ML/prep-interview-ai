"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import NextLink from "next/link";

import { Logo } from "@/config/Logo";
import HeaderUser from "./HeaderUser";
import { Button, Link, Skeleton, User } from "@heroui/react";
import { Icon } from "@iconify/react";
import { siteConfig } from "@/config/site";
import { useSession } from "next-auth/react";
import { IUser } from "@/backend/models/user.model";

const Navbar = () => {
  const { data } = useSession();
  const user = data?.user as IUser;

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">{siteConfig?.name}</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2"></NavbarItem>

        {data?.user ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button
                className="bg-foreground font-medium text-background px-5"
                color="secondary"
                radius="full"
                variant="flat"
                as={Link}
                href="/subscribe"
              >
                Subscribe for $9.99
              </Button>
            </NavbarItem>
            <NavbarItem className="hidden sm:flex">
              <HeaderUser user={user} />
            </NavbarItem>
          </>
        ) : (
          <>
            {data === undefined && (
              <div className="max-w-[200px] w-full flex items-center gap-3">
                <div>
                  <Skeleton className="flex rounded-full w-12 h-12" />
                </div>
                <div className="w-full flex flex-col gap-2">
                  <Skeleton className="h-3 w-3/5 rounded-lg" />
                  <Skeleton className="h-3 w-4/5 rounded-lg" />
                </div>
              </div>
            )}
            {data === null && (
              <Button
                className="bg-foreground font-medium text-background px-5"
                color="secondary"
                endContent={<Icon icon="tabler:login" />}
                radius="full"
                variant="flat"
                as={Link}
                href="/login"
              >
                Login
              </Button>
            )}
          </>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle aria-label="Open menu" />
      </NavbarContent>

      <NavbarMenu className="pt-16">
        <User
          as="button"
          avatarProps={{
            isBordered: true,
            src: "/images/default_user.png",
          }}
          className="transition-transform mb-5"
          description="john.doe@example.com"
          name="John Doe"
        />
        <NavbarMenuItem>
          <Link
            color={"foreground"}
            href="/admin/dashboard"
            size="lg"
            className="flex gap-1"
          >
            <Icon icon="tabler:user-cog" /> Admin Dashboard
          </Link>
        </NavbarMenuItem>

        <NavbarMenuItem>
          <Link
            color={"foreground"}
            href="/app/dashboard"
            size="lg"
            className="flex gap-1"
          >
            <Icon icon="hugeicons:ai-brain-04" /> App Dashboard
          </Link>
        </NavbarMenuItem>

        <NavbarMenuItem>
          <Link color={"danger"} as={Link} size="lg" className="flex gap-1">
            <Icon icon="tabler:logout-2" /> Logout
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </NextUINavbar>
  );
};

export default Navbar;