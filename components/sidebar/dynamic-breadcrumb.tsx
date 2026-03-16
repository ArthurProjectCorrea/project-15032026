"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { breadcrumbConfig } from "@/lib/breadcrumb-config"

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  
  // Check for manual trail in config first
  const manualTrail = breadcrumbConfig[pathname]
  
  if (Array.isArray(manualTrail)) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {manualTrail.map((item, index) => {
            const isLast = index === manualTrail.length - 1
            return (
              <React.Fragment key={`${item.label}-${index}`}>
                <BreadcrumbItem className={!isLast ? "hidden md:block" : ""}>
                  {isLast || !item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Fallback to dynamic generation
  const segments = pathname.split("/").filter(Boolean)
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          const href = `/${segments.slice(0, index + 1).join("/")}`
          
          const label = 
            breadcrumbConfig[href] as string || 
            breadcrumbConfig[segment.toLowerCase()] as string || 
            segment
          
          return (
            <React.Fragment key={href}>
              <BreadcrumbItem className={!isLast ? "hidden md:block" : ""}>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
