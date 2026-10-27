import Link from "next/link";
import React from "react";
type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const AuthCard = ({
  title,
  description,
  children,
  footer,
}: AuthCardProps) => {
  return (
    <>
      <div className="mb-7 space-y-2">
        <h1 className="font-heading text-[1.75rem]">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}

      {footer ? (
        <p className="text-muted-foreground mt-8 text-sm">{footer}</p>
      ) : null}
    </>
  );
};

export const AuthLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link href={href} className="text-foreground hover:text-primary">
      {children}
    </Link>
  );
};
