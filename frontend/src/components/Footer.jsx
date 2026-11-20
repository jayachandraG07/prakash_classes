import React from "react";
import { Clock, GraduationCap, MapPin, Phone } from "lucide-react";
import { ADDRESS, PHONE_DISPLAY, PHONE_TEL } from "../data/constants";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="border-t border-yellow-200 bg-[#FFFBEB] text-stone-600">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display flex items-center gap-2 text-lg font-bold text-stone-900">
            <GraduationCap className="h-5 w-5 text-amber-600" />
            Prakash Classes
          </p>
          <p className="mt-2 text-sm">Maths &amp; Science coaching in Madhapur since 2012.</p>
        </div>
        <p data-testid="footer-address" className="flex gap-2 text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
          {ADDRESS}
        </p>
        <div className="space-y-2 text-sm">
          <a href={`tel:${PHONE_TEL}`} className="flex gap-2 hover:text-amber-600">
            <Phone className="h-4 w-4 text-amber-600" />
            {PHONE_DISPLAY}
          </a>
          <p className="flex gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Batches: 11 AM • 4 PM • 6 PM • 8 PM
          </p>
        </div>
      </div>
      <p className="border-t border-yellow-200 py-6 text-center text-xs text-slate-500">
        © 2026 Prakash Classes, Madhapur. All rights reserved.
      </p>
    </footer>
  );
}
