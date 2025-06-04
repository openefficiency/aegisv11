"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentSales = [
  {
    name: "Anonymous Reporter #1",
    email: "reporter1@secure.com",
    amount: "+$1,999.00",
    avatar: "/avatars/01.png",
    initials: "AR",
  },
  {
    name: "Anonymous Reporter #2",
    email: "reporter2@secure.com",
    amount: "+$39.00",
    avatar: "/avatars/02.png",
    initials: "BR",
  },
  {
    name: "Anonymous Reporter #3",
    email: "reporter3@secure.com",
    amount: "+$299.00",
    avatar: "/avatars/03.png",
    initials: "CR",
  },
  {
    name: "Anonymous Reporter #4",
    email: "reporter4@secure.com",
    amount: "+$99.00",
    avatar: "/avatars/04.png",
    initials: "DR",
  },
  {
    name: "Anonymous Reporter #5",
    email: "reporter5@secure.com",
    amount: "+$39.00",
    avatar: "/avatars/05.png",
    initials: "ER",
  },
]

export function RecentSales() {
  return (
    <div className="space-y-8">
      {recentSales.map((sale, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={sale.avatar || "/placeholder.svg"} alt="Avatar" />
            <AvatarFallback>{sale.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">{sale.amount}</div>
        </div>
      ))}
    </div>
  )
}
