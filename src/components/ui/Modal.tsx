"use client";
import React from "react";
import { X } from "lucide-react";
import { cn } from "./Button";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: any;
  children: React.ReactNode;
  showClose?: boolean;
  className?: string;
  bodyClassName?: string;
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showClose = true,
  className,
  bodyClassName,
}: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <div className={cn("relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5", className)}>
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="text-base text-slate-900">
            {title}
          </div>
          {showClose && (
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );
}
