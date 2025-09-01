import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plane, Calendar, BedDouble, Utensils, FerrisWheel, Clock, User, CheckCircle, ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ItineraryItem } from "@/src/types";

function getIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    stay: <BedDouble className="w-5 h-5" />,
    flight: <Plane className="w-5 h-5" />,
    food: <Utensils className="w-5 h-5" />,
    visit: <FerrisWheel className="w-5 h-5" />
  };
  return icons[type] || <Calendar className="w-5 h-5" />;
}

function getBadgeStyle(type: string) {
  const styles: Record<string, string> = {
    stay: "border-green-300 bg-green-50 text-green-800",
    flight: "border-blue-300 bg-blue-50 text-blue-800",
    food: "border-orange-300 bg-orange-50 text-orange-800",
    visit: "border-purple-300 bg-purple-50 text-purple-800"
  };
  return styles[type] || "border-gray-300 bg-gray-50 text-gray-800";
}

type ItineraryItemCardProps = {
  readonly item: ItineraryItem;
  readonly showBadge?: boolean;
};

export function ItineraryItemCard({ item, showBadge = true }: ItineraryItemCardProps) {
  const itemLink = (item as any).link || (item as any).details?.flight1?.link || (item as any).details?.flight2?.link;
  return (
    <Card className={`bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200/50 print:shadow-none print:border${itemLink ? ' cursor-pointer' : ''}`} onClick={itemLink ? () => window.open(itemLink, '_blank', 'noopener,noreferrer') : undefined} onKeyDown={itemLink ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(itemLink, '_blank', 'noopener,noreferrer'); } } : undefined} role={itemLink ? 'link' : undefined} tabIndex={itemLink ? 0 : undefined} aria-label={itemLink ? `Open link for ${item.title}` : undefined}>
      {item.type === 'stay' && item.image && (
        <img src={item.image} alt={item.title} className="w-full h-64 object-cover" />
      )}
      <CardContent className="p-5 md:p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            {showBadge && (
              <Badge variant="outline" className={`${getBadgeStyle(item.type)} mb-2`}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Badge>
            )}
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              {getIcon(item.type)} {item.title}
            </h3>
            {item.location && (
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                {item.location}
              </p>
            )}
          </div>
          {itemLink && (
            <span aria-hidden="true" title={`Open link for ${item.title}`}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 pointer-events-none">
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        {item.type === "stay" && (
          <div className="space-y-3 text-gray-700">
            {item.host && (
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> {item.host}
              </p>
            )}
            {(item as any).details?.source && (
              <p className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                Booked via: <strong>{(item as any).details.source}</strong>
              </p>
            )}
            {(item as any).details?.checkin && (
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Check-in: <strong>{(item as any).details.checkin}</strong>
              </p>
            )}
            {(item as any).details?.checkout && (
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Check-out: <strong>{(item as any).details.checkout}</strong>
              </p>
            )}
            {(item as any).details?.status && (
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>{(item as any).details.status}</span>
              </div>
            )}
          </div>
        )}

        {item.type === "flight" && (
          <div className="space-y-4 text-gray-800">
            {(item as any).details?.departure && (item as any).details?.arrival && (
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-2xl font-bold">{(item as any).details.departure.time}</p>
                  <p className="font-semibold text-gray-600">
                    {(item as any).details.departure.airport}
                    {(item as any).details.departure.terminal && (
                      <span className="text-gray-500"> · T{(item as any).details.departure.terminal}</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-center text-gray-500 px-4">
                  <Plane className="w-6 h-6" />
                  <span className="text-xs mt-1 font-medium">{(item as any).details.duration}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{(item as any).details.arrival.time}</p>
                  <p className="font-semibold text-gray-600">{(item as any).details.arrival.airport}</p>
                </div>
              </div>
            )}
            {(item as any).details?.flight1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Plane className="w-5 h-5 text-gray-500"/>
                  <div>
                    <p className="font-semibold text-gray-800">{(item as any).details.flight1.route}</p>
                    <p className="text-sm text-gray-500">{(item as any).details.flight1.departure} - {(item as any).details.flight1.arrival} • {(item as any).details.flight1.flight}</p>
                  </div>
                </div>
                {(item as any).details?.flight2 && (
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Plane className="w-5 h-5 text-gray-500"/>
                    <div>
                      <p className="font-semibold text-gray-800">{(item as any).details.flight2.route}</p>
                      <p className="text-sm text-gray-500">{(item as any).details.flight2.departure} - {(item as any).details.flight2.arrival} • {(item as any).details.flight2.flight}</p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500 pt-2">
                  Operator: {(item as any).details.operator}
                </p>
              </div>
            )}
          </div>
        )}

        {item.type === "visit" && (
          <div className="space-y-4">
            {(item.options || []).map((opt, i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${
                        opt.label === "Main"
                          ? "border-blue-300 bg-blue-50 text-blue-800"
                          : opt.label === "Bonus"
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </Badge>
                    <p className="font-semibold text-gray-900">{opt.nameLocal}</p>
                  </div>
                </div>
                <p className="text-gray-700 mt-1">
                  <span className="font-medium">What:</span> {opt.what}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Why:</span> {opt.why}
                </p>
              </div>
            ))}
            {item.footerNote && <p className="text-sm text-gray-500 pt-1">{item.footerNote}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
