'use client';

import { forwardRef, HTMLAttributes, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

type ModalHeaderProps = HTMLAttributes<HTMLDivElement>;

type ModalBodyProps = HTMLAttributes<HTMLDivElement>;

type ModalFooterProps = HTMLAttributes<HTMLDivElement>;

const maxWidthStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      closeOnBackdrop = true,
      closeOnEscape = true,
      maxWidth = 'md',
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (closeOnEscape && e.key === 'Escape') {
          onClose();
        }
      },
      [closeOnEscape, onClose],
    );

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        if (isOpen) {
          document.body.style.overflow = '';
        }
      };
    }, [isOpen, handleEscape]);

    if (!isOpen) {
      return null;
    }

    const modalContent = (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={closeOnBackdrop ? onClose : undefined}
        />
        <div
          ref={ref}
          className={`relative bg-white border-4 border-black ${maxWidthStyles[maxWidth]} w-full mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}
          {...props}
        >
          {children}
        </div>
      </div>
    );

    if (typeof window === 'undefined') {
      return null;
    }

    return createPortal(modalContent, document.body);
  },
);
Modal.displayName = 'Modal';

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-4 sm:p-6 border-b-2 border-black ${className}`} {...props}>
        {children}
      </div>
    );
  },
);
ModalHeader.displayName = 'ModalHeader';

const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-lg sm:text-xl font-black text-black text-center uppercase ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  },
);
ModalTitle.displayName = 'ModalTitle';

const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-4 sm:p-6 ${className}`} {...props}>
        {children}
      </div>
    );
  },
);
ModalBody.displayName = 'ModalBody';

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-4 sm:p-6 border-t-2 border-black flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle };
export type { ModalBodyProps, ModalFooterProps, ModalHeaderProps, ModalProps };
