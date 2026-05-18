import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Gift,
  Award,
  ChevronRight,
  TrendingUp,
  Percent,
  CheckCircle,
  Copy,
  Coins,
  History,
  Share2,
  Users
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function CustomerRewards() {
  const [copiedCode, setCopiedCode] = useState(null);

  const walletData = {
    cashBalance: "$125.50",
    pointsBalance: "4,250 PTS",
    pointsCashEquivalent: "$42.50",
    currentTier: "Gold Elite",
    pointsToNextTier: 750,
    nextTier: "Platinum VIP",
    progressPercent: 85
  };

  const ledgerHistory = [
    { id: "tx1", title: "Reservation Reward - Sakura Omakase", type: "earn", date: "2026-05-18", amount: "+250 PTS", status: "credited" },
    { id: "tx2", title: "Weekend Promotion Cashback", type: "cash", date: "2026-05-16", amount: "+$15.00", status: "credited" },
    { id: "tx3", title: "Points Redeemed for booking coupon", type: "redeem", date: "2026-05-10", amount: "-1,000 PTS", status: "debited" },
    { id: "tx4", title: "Referral Bonus - Rahul S.", type: "earn", date: "2026-05-04", amount: "+500 PTS", status: "credited" },
    { id: "tx5", title: "Reservation Reward - The Capital Grill", type: "earn", date: "2026-05-02", amount: "+200 PTS", status: "credited" }
  ];

  const coupons = [
    { code: "BMTGOLD10", desc: "Flat 10% Off on all Japanese restaurants", expires: "June 30, 2026", minSpend: "$50" },
    { code: "WEEKEND25", desc: "$25 Cashback on reserving table after 8 PM", expires: "June 15, 2026", minSpend: "$100" },
    { code: "FIRSTMEAL", desc: "Free beverage + dessert on first check-in", expires: "Dec 31, 2026", minSpend: "$0" }
  ];

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 pb-12">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          Loyalty Wallet & Rewards
        </h1>
        <p className="text-xs md:text-sm text-slate-500">Track your points, wallet cash balances, coupon deals, and tier status progress</p>
      </div>

      {/* 1. KEY STATUS SCOREBOARD */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Cash Balance Display */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-md">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-15 text-white pointer-events-none">
            <Wallet className="h-28 w-28" />
          </div>
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <span className="text-[10px] font-extrabold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full w-fit uppercase">
              Wallet Cash Balance
            </span>
            <div className="space-y-1">
              <h2 className="text-4xl font-extrabold tracking-tight">{walletData.cashBalance}</h2>
              <p className="text-xs text-emerald-100">Ready to spend instantly on reservations</p>
            </div>
            <Button size="sm" className="bg-white hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl mt-2 w-fit">
              Top Up Cash
            </Button>
          </CardContent>
        </Card>

        {/* Loyalty Points Display */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-white border-none shadow-md">
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-15 text-white pointer-events-none">
            <Coins className="h-28 w-28" />
          </div>
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <span className="text-[10px] font-extrabold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full w-fit uppercase">
              Accumulated Points
            </span>
            <div className="space-y-1">
              <h2 className="text-4xl font-extrabold tracking-tight">{walletData.pointsBalance}</h2>
              <p className="text-xs text-primary-foreground/80">Equivalent to {walletData.pointsCashEquivalent} cashback</p>
            </div>
            <Button size="sm" className="bg-white hover:bg-primary/10 text-primary font-bold rounded-xl mt-2 w-fit">
              Redeem Points
            </Button>
          </CardContent>
        </Card>

        {/* Loyalty Tier Progress Card */}
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CURRENT TIER LEVEL</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                  {walletData.currentTier}
                </span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-[9px] px-2 py-0.5 rounded-md">85% Elite</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>{walletData.currentTier}</span>
                <span>{walletData.nextTier}</span>
              </div>
              <Progress value={walletData.progressPercent} className="h-2.5 bg-slate-100 [&>div]:bg-primary rounded-full" />
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">
              Only <span className="font-bold text-slate-800">{walletData.pointsToNextTier} PTS</span> left to reach platinum VIP levels for waived booking deposits and gourmet gifts.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEDGER POINTS TRANSACTION LIST */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-slate-400" />
            Ledger & Cashback History
          </h2>
          
          <Card className="shadow-sm border-slate-100 bg-white overflow-hidden rounded-3xl">
            <div className="divide-y divide-slate-50">
              {ledgerHistory.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-950 block">{log.title}</span>
                    <span className="text-slate-400 block">{log.date}</span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className={`font-extrabold block text-sm ${
                      log.type === "redeem" ? "text-slate-500" : "text-emerald-600"
                    }`}>
                      {log.amount}
                    </span>
                    <Badge variant="secondary" className={`text-[9px] font-bold rounded px-1.5 py-0.5 ${
                      log.type === "redeem" ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {log.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* COUPON COLLECTIONS & REFERRAL BLOCKS */}
        <div className="space-y-6">
          {/* Active Copon Deals */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
              <Percent className="h-4.5 w-4.5 text-slate-400" />
              Available Coupons
            </h2>

            <div className="space-y-3.5">
              {coupons.map((coupon) => (
                <Card key={coupon.code} className="bg-white border-slate-100 border-dashed shadow-inner p-4 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5 text-slate-900 group-hover:scale-105 transition pointer-events-none">
                    <Percent className="h-16 w-16" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-sm text-slate-900 tracking-wider">{coupon.code}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(coupon.code, "Coupon code")}
                        className="h-7 px-2.5 text-[10px] font-bold border rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                      >
                        {copiedCode === coupon.code ? <CheckCircle className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        {copiedCode === coupon.code ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-snug">{coupon.desc}</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-2">
                    <span>MIN SPEND: {coupon.minSpend}</span>
                    <span>EXP: {coupon.expires}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Social Referrals */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-slate-400" />
              Refer & Earn
            </h2>

            <Card className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-5 rounded-3xl space-y-4 relative overflow-hidden shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider block">REFERRAL CAMPAIGN</span>
                <h3 className="font-extrabold text-base">Earn $25 for every referral</h3>
                <p className="text-[10px] text-indigo-200 leading-normal">Invite a fellow diner to book their next table. They receive a free welcome appetizer, and you gain $25 cashback in your wallet!</p>
              </div>

              <div className="flex gap-2 bg-white/10 p-1.5 rounded-xl border border-white/10 items-center justify-between">
                <span className="font-mono text-xs font-bold text-white px-2">BMT-RAHUL-REF</span>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard("BMT-RAHUL-REF", "Referral code")}
                  className="h-8 bg-white hover:bg-indigo-50 text-indigo-950 font-bold rounded-lg text-xs"
                >
                  Copy Link
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
}
