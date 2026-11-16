"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import UseAnimations, { type Animation, type Interaction } from "react-useanimations";
import arrowDown from "react-useanimations/lib/arrowDown";
import arrowRight from "react-useanimations/lib/arrowRight";
import arrowUpRight from "react-useanimations/lib/arrowUpRight";
import award from "react-useanimations/lib/award";
import bookmark from "react-useanimations/lib/bookmark";
import calendar from "react-useanimations/lib/calendar";
import checkmark from "react-useanimations/lib/checkmark";
import chevronDown from "react-useanimations/lib/chevronDown";
import facebook from "react-useanimations/lib/facebook";
import filter from "react-useanimations/lib/filter";
import heart from "react-useanimations/lib/heart";
import instagram from "react-useanimations/lib/instagram";
import loading from "react-useanimations/lib/loading";
import mail from "react-useanimations/lib/mail";
import mapPin from "react-useanimations/lib/mapPin";
import maximizeMinimize from "react-useanimations/lib/maximizeMinimize";
import menu from "react-useanimations/lib/menu";
import penTool from "react-useanimations/lib/penTool";
import phone from "react-useanimations/lib/phone";
import playPause from "react-useanimations/lib/playPause";
import plusToX from "react-useanimations/lib/plusToX";
import scissors from "react-useanimations/lib/scissors";
import scrollDown from "react-useanimations/lib/scrollDown";
import searchToX from "react-useanimations/lib/searchToX";
import share from "react-useanimations/lib/share";
import shoppingBag from "react-useanimations/lib/shoppingBag";
import user from "react-useanimations/lib/user";
import volume from "react-useanimations/lib/volume";
import youtube from "react-useanimations/lib/youtube";
import { cn } from "@/lib/cn";

/**
 * The animated icon set (useAnimations). Every icon carries its own motion:
 * the menu morphs to a cross, the search glass becomes a close mark, the bag
 * swings on hover. Icons follow the current text colour.
 */
const ICONS = {
  arrowDown,
  arrowRight,
  arrowUpRight,
  award,
  bookmark,
  calendar,
  checkmark,
  chevronDown,
  facebook,
  filter,
  heart,
  instagram,
  loading,
  mail,
  mapPin,
  maximizeMinimize,
  menu,
  penTool,
  phone,
  playPause,
  plusToX,
  scissors,
  scrollDown,
  searchToX,
  share,
  shoppingBag,
  user,
  volume,
  youtube,
} satisfies Record<string, Animation>;

export type IconName = keyof typeof ICONS;

const THIN = "[&_path]:[stroke-width:1.35] [&_line]:[stroke-width:1.35] [&_circle]:[stroke-width:1.35] [&_rect]:[stroke-width:1.35] [&_polyline]:[stroke-width:1.35] [&_ellipse]:[stroke-width:1.35]";

type IconProps = {
  name: IconName;
  size?: number;
  interaction?: Interaction;
  /** For toggle icons (menu, searchToX, playPause, volume, plusToX, heart): show the end state. */
  active?: boolean;
  className?: string;
};

/** A decorative animated icon. Plays on hover (or loops) on its own. */
export function Icon({ name, size = 20, interaction, active, className }: IconProps) {
  return <UseAnimations animation={ICONS[name]} size={size} interaction={interaction} active={active} className={cn("inline-flex", THIN, className)} aria-hidden />;
}

type IconButtonProps = IconProps & {
  label: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Render as a link instead of a button. */
  href?: string;
  expanded?: boolean;
  controls?: string;
  pressed?: boolean;
  children?: ReactNode;
};

/**
 * A real button (or link) around an animated icon: the whole hit area drives
 * the animation, and it is reachable and labelled for keyboard and screen readers.
 */
export function IconButton({ name, size = 20, interaction, active, className, label, onClick, href, expanded, controls, pressed, children }: IconButtonProps) {
  const classes = cn(
    "relative inline-flex h-11 min-w-11 items-center justify-center gap-2 text-current transition-opacity duration-300 hover:opacity-70",
    className,
  );
  return (
    <UseAnimations
      animation={ICONS[name]}
      size={size}
      interaction={interaction}
      active={active}
      onClick={onClick}
      render={(eventProps, animationProps) =>
        href ? (
          <Link href={href} aria-label={label} className={classes} {...eventProps}>
            <span {...animationProps} className={THIN} />
            {children}
          </Link>
        ) : (
          <button type="button" aria-label={label} aria-expanded={expanded} aria-controls={controls} aria-pressed={pressed} className={classes} {...eventProps}>
            <span {...animationProps} className={THIN} />
            {children}
          </button>
        )
      }
    />
  );
}
