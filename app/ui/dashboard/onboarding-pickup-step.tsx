"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { TruckIcon, MapPinIcon } from "@heroicons/react/24/outline";

const LocationPicker = dynamic(() => import("@/app/ui/store/location-picker"), {
  ssr: false,
});

interface OnboardingPickupStepProps {
  initialOffersPickup?: boolean;
  initialPickupLatitude?: number | null;
  initialPickupLongitude?: number | null;
  initialPickupAddressDetails?: string | null;
  onPickupDataChange: (data: {
    offersPickup: boolean;
    pickupLatitude: number | null;
    pickupLongitude: number | null;
    pickupAddressDetails: string | null;
  }) => void;
}

export default function OnboardingPickupStep({
  initialOffersPickup = false,
  initialPickupLatitude = null,
  initialPickupLongitude = null,
  initialPickupAddressDetails = null,
  onPickupDataChange,
}: OnboardingPickupStepProps) {
  const [offersPickup, setOffersPickup] = useState(initialOffersPickup);
  const [pickupLatitude, setPickupLatitude] = useState<number | null>(
    initialPickupLatitude
  );
  const [pickupLongitude, setPickupLongitude] = useState<number | null>(
    initialPickupLongitude
  );
  const [pickupAddressDetails, setPickupAddressDetails] = useState(
    initialPickupAddressDetails || ""
  );

  // Notify parent of changes
  useEffect(() => {
    onPickupDataChange({
      offersPickup,
      pickupLatitude: offersPickup ? pickupLatitude : null,
      pickupLongitude: offersPickup ? pickupLongitude : null,
      pickupAddressDetails: offersPickup ? pickupAddressDetails : null,
    });
  }, [
    offersPickup,
    pickupLatitude,
    pickupLongitude,
    pickupAddressDetails,
    onPickupDataChange,
  ]);

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, details?: string) => {
      setPickupLatitude(lat);
      setPickupLongitude(lng);
      // Don't override the address details textarea if user has typed something
      if (details && !pickupAddressDetails) {
        setPickupAddressDetails(details);
      }
    },
    [pickupAddressDetails]
  );

  const handleToggleChange = (enabled: boolean) => {
    setOffersPickup(enabled);
    // Clear location data when disabling pickup
    if (!enabled) {
      setPickupLatitude(null);
      setPickupLongitude(null);
      setPickupAddressDetails("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-purple-100 p-4 mb-4">
          <TruckIcon className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Pickup Location
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Do you want to offer pickup as a delivery option? If yes, set your
          pickup location so customers know where to collect their orders.
        </p>
      </div>

      <div className="space-y-4 rounded-xl bg-slate-50 p-5">
        {/* Offers Pickup Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200">
          <div>
            <label
              htmlFor="offers-pickup-toggle"
              className="block text-sm font-bold text-slate-700 cursor-pointer"
            >
              I offer pickup for my orders
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Customers can collect orders from your location
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="offers-pickup-toggle"
              type="checkbox"
              checked={offersPickup}
              onChange={(e) => handleToggleChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Pickup Location Details - Only shown when toggle is enabled */}
        {offersPickup && (
          <div className="space-y-4 pt-2">
            {/* Location Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-purple-600" />
                Pickup Location{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLat={pickupLatitude || undefined}
                  initialLng={pickupLongitude || undefined}
                />
              </div>
            </div>

            {/* Address Details Textarea */}
            <div>
              <label
                htmlFor="pickup-address-details"
                className="block text-xs font-bold text-slate-600 mb-1"
              >
                Address Details{" "}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="pickup-address-details"
                value={pickupAddressDetails}
                onChange={(e) =>
                  setPickupAddressDetails(e.target.value.slice(0, 500))
                }
                rows={3}
                maxLength={500}
                placeholder="e.g. 123 Market Street, Ikeja, Lagos. Look for the blue building next to the bank."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Help customers find your pickup location easily
                </p>
                <p
                  className={`text-xs ${pickupAddressDetails.length > 500 ? "text-red-500" : "text-slate-400"}`}
                >
                  {pickupAddressDetails.length}/500
                </p>
              </div>
            </div>

            {/* Validation Message */}
            {!pickupLatitude || !pickupLongitude ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <p className="text-xs text-amber-700">
                  <strong>Required:</strong> Please select a pickup location on
                  the map above to continue.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-2">
                <span className="text-lg">✓</span>
                <p className="text-xs text-emerald-700">
                  <strong>Pickup location set!</strong> Customers will be able
                  to select pickup as a delivery option.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info box when pickup is disabled */}
        {!offersPickup && (
          <div className="rounded-xl bg-slate-100 border border-slate-200 p-4">
            <p className="text-xs text-slate-600">
              💡 <strong>Tip:</strong> Offering pickup can reduce delivery costs
              and attract nearby customers who prefer to collect their orders in
              person.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
