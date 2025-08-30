import React from "react";
import { Calendar, MapPin, Plane, Home, Clock, User, CheckCircle, ArrowUpRight, BedDouble, Utensils, FerrisWheel } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TripItinerary() {
  // Trip data extracted and updated from attachments
  const tripData = [
    {
      date: "2024-09-24",
      type: "flight",
      title: "Flight to Tel Aviv",
      details: {
        departure: { time: "20:00", airport: "GVA" },
        arrival: { time: "16:40", airport: "TLV" },
        duration: "4h 19m"
      }
    },
    {
      date: "2024-10-01",
      type: "stay",
      title: "Casa Aga - Cozy Seaside Apartment",
      location: "Ericeira",
      details: {
        dates: "Oct 1 – Oct 4",
        status: "Confirmed",
        cancellation: "Free cancellation"
      },
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0bf3f9bbb_image.png",
      link: "https://secure.booking.com/confirmation.en-us.html?label=gen173bo-10CAEoggI46AdIM1gDaGqIAQGYATO4AQfIAQzYAQPoAQH4AQGIAgGYAiGoAgG4AqPYy8UGwAIB0gIkYmRiMWVlOGEtOTM2MC00Y2YwLTk0YjUtNTM0YmQ0ZDdhOGEz2AIB4AIB&sid=4cffe0bf03e3421cac79dfa4ed1dbaa8&aid=304142&auth_key=xvGmUB2RQGdPvAvi&source=mytrips"
    },
    {
      date: "2024-10-04",
      type: "stay",
      title: "Home in Atouguia da Baleia",
      location: "Rua da Liberdade 31",
      host: "Hosted by João",
      details: {
        checkin: "Sat, Oct 4 - 3:00 PM",
        checkout: "Mon, Oct 6 - 10:00 AM"
      },
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/dfa8e4364_image.png",
      link: "https://www.airbnb.com/trips/v1/reservation-details/ro/RESERVATION2_CHECKIN/HM3MYWEBTT"
    },
    {
      date: "2024-10-06",
      type: "stay", 
      title: "Home in Gondar",
      location: "Rua da Quinta do Peso",
      host: "Hosted by Peso",
      details: {
        checkin: "Mon, Oct 6 - 3:00 PM", 
        checkout: "Thu, Oct 9 - 11:00 AM"
      },
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ab5803a60_image.png",
      link: "https://www.airbnb.com/trips/v1/reservation-details/ro/RESERVATION2_CHECKIN/HM5KYX2RR4/g"
    },
    {
      date: "2024-10-18",
      type: "flight",
      title: "Connecting Flights Home",
      details: {
        flight1: {
          route: "Funchal Madeira → Prague",
          flight: "QS1171",
          departure: "16:40",
          arrival: "22:10",
          date: "18Oct2025",
        },
        flight2: {
          route: "Prague → Tel Aviv",
          flight: "QS1286", 
          departure: "23:45",
          arrival: "04:35",
          date: "18Oct2025 → 19Oct2025",
        },
        operator: "SMARTWINGS",
        status: "OK"
      }
    }
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };
  const formatWeekday = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getIcon = (type) => {
    const icons = {
      stay: <BedDouble className="w-5 h-5" />,
      flight: <Plane className="w-5 h-5" />,
      food: <Utensils className="w-5 h-5" />,
      visit: <FerrisWheel className="w-5 h-5" />
    };
    return icons[type] || <Calendar className="w-5 h-5"/>;
  }
  
  const getBadgeStyle = (type) => {
    const styles = {
      stay: "border-green-300 bg-green-50 text-green-800",
      flight: "border-blue-300 bg-blue-50 text-blue-800",
      food: "border-orange-300 bg-orange-50 text-orange-800",
      visit: "border-purple-300 bg-purple-50 text-purple-800",
    }
    return styles[type] || "border-gray-300 bg-gray-50 text-gray-800";
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-20 border-b border-gray-200/80">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Portugal Trip</h1>
          <p className="text-gray-500">September – October 2024</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="space-y-12">
          {tripData.map((item, index) => (
            <div key={index}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{formatDate(item.date)}</h2>
                <p className="text-gray-500">{formatWeekday(item.date)}</p>
              </div>

              <Card className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200/50">
                {item.type === 'stay' && item.image && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    <img src={item.image} alt={item.title} className="w-full h-64 object-cover" />
                  </a>
                )}
                
                <CardContent className="p-5 md:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge variant="outline" className={`${getBadgeStyle(item.type)} mb-2`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </Badge>
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      {item.location && 
                        <p className="text-gray-600 flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {item.location}</p>
                      }
                    </div>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                          <ArrowUpRight className="w-5 h-5" />
                        </Button>
                      </a>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 my-4"></div>

                  {item.type === 'stay' && (
                    <div className="space-y-3 text-gray-700">
                      {item.host && <p className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> {item.host}</p>}
                      {item.details.checkin && <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/> Check-in: <strong>{item.details.checkin.split(' - ')[1]}</strong></p>}
                      {item.details.checkout && <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/> Check-out: <strong>{item.details.checkout.split(' - ')[1]}</strong></p>}
                       {item.details.status && (
                          <div className="flex items-center gap-2 text-green-700 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            <span>{item.details.status}</span>
                          </div>
                        )}
                    </div>
                  )}

                  {item.type === 'flight' && (
                     <div className="space-y-4">
                        {item.details.departure && (
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-2xl font-bold text-gray-800">{item.details.departure.time}</p>
                                    <p className="font-semibold text-gray-600">{item.details.departure.airport}</p>
                                </div>
                                <div className="flex flex-col items-center text-gray-500 px-4">
                                    <Plane className="w-6 h-6"/>
                                    <span className="text-xs mt-1 font-medium">{item.details.duration}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-800">{item.details.arrival.time}</p>
                                    <p className="font-semibold text-gray-600">{item.details.arrival.airport}</p>
                                </div>
                            </div>
                        )}
                        {item.details.flight1 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <Plane className="w-5 h-5 text-gray-500"/>
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.details.flight1.route}</p>
                                        <p className="text-sm text-gray-500">{item.details.flight1.departure} - {item.details.flight1.arrival} • {item.details.flight1.flight}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <Plane className="w-5 h-5 text-gray-500"/>
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.details.flight2.route}</p>
                                        <p className="text-sm text-gray-500">{item.details.flight2.departure} - {item.details.flight2.arrival} • {item.details.flight2.flight}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 pt-2">Operator: {item.details.operator} • Status: <span className="text-green-600 font-medium">{item.details.status}</span></p>
                            </div>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-10">
        <div className="text-center text-gray-400 text-sm">
          <p>End of itinerary.</p>
        </div>
      </footer>
    </div>
  );
}