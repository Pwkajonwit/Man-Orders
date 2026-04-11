"use client";
import React from "react";
import { X } from "lucide-react";
import { cn } from "./Button";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showClose?: boolean;
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showClose = true,
}: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/30 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 animate-in zoom-in-95 duration-200">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-900">
            {title}
          </h2>
          {showClose && (
            <button
              onClick={onClose}
              className="rounded-md border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
