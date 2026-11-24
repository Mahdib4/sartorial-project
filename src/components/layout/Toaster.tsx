"use client";

import { ToastStack } from "@/components/bencho/toast-stack/ToastStack";
import { useShop } from "@/store/shop";

/**
 * Confirms what just happened (added to bag, saved) in the corner of the screen.
 * On a product page on a phone it rises above the "Add to bag" bar at the foot
 * of the screen (which publishes its height as --buy-bar-h) instead of covering it.
 */
export function Toaster() {
  const { toasts, dismiss, lookup } = useShop();

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-[calc(0.75rem+var(--buy-bar-h,0px))] z-[60] flex justify-end transition-[bottom] duration-300 sm:inset-x-auto sm:right-5 sm:bottom-[calc(1.25rem+var(--buy-bar-h,0px))] sm:w-[380px]">
      <ToastStack
        className="pointer-events-auto w-full"
        label="Notifications"
        onDismiss={dismiss}
        onAction={dismiss}
        toasts={toasts.map((t) => {
          const product = t.slug ? lookup(t.slug) : undefined;
          return {
            id: t.id,
            title: t.title,
            body: t.body,
            href: t.href,
            actionLabel: t.actionLabel,
            image: product ? { src: product.image.src, srcSet: product.image.srcSet, sizes: "44px", alt: "" } : undefined,
          };
        })}
      />
    </div>
  );
}
