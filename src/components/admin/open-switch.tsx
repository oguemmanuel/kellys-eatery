"use client";

import { useOptimistic, useTransition } from "react";
import { setKitchenOpen } from "@/app/admin/actions";
import { Toggle } from "@/components/admin/toggle";

export function OpenSwitch({ isOpen }: { isOpen: boolean }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useOptimistic(isOpen);

  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <span className={open ? "text-brand" : "text-muted"}>
        {open ? "Open" : "Closed"}
      </span>
      <Toggle
        checked={open}
        label="Kitchen open for regular orders"
        pending={pending}
        onChange={(next) =>
          startTransition(async () => {
            setOpen(next);
            await setKitchenOpen(next);
          })
        }
      />
    </label>
  );
}
