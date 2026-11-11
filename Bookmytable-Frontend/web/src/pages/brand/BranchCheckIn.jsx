import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useMutation } from "@tanstack/react-query";
import {
  Camera,
  CameraOff,
  QrCode,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  CalendarDays,
  Clock,
  Hash,
  Loader2,
  ScanLine,
  ShieldCheck,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBranch } from "@/context/BranchContext";
import { verifyBookingCheckIn } from "@/services/booking.service";

const SCANNER_ELEMENT_ID = "bmt-checkin-qr-reader";

// Map API error codes to human-friendly messages
const ERROR_MESSAGES = {
  BOOKING_NOT_FOUND:        { title: "Booking Not Found", message: "No booking matched this QR token. It may have been tampered with." },
  INVALID_QR_TOKEN:         { title: "Invalid QR Code", message: "This QR code is not a valid BookMyTable check-in token." },
  QR_ALREADY_USED:          { title: "Already Checked In", message: "This QR code has already been used for check-in." },
  QR_EXPIRED:               { title: "QR Code Expired", message: "The check-in window for this booking has closed." },
  QR_REVOKED:               { title: "QR Code Revoked", message: "This QR code has been revoked and can no longer be used." },
  CHECK_IN_TOO_EARLY:       { title: "Too Early", message: "Check-in opens 30 minutes before your booking time. Please wait." },
  CHECK_IN_WINDOW_CLOSED:   { title: "Check-in Window Closed", message: "The 60-minute check-in window for this booking has passed." },
  WRONG_BRANCH:             { title: "Wrong Branch", message: "This booking is for a different restaurant branch." },
  BOOKING_NOT_CONFIRMED:    { title: "Booking Not Confirmed", message: "Only confirmed bookings can be checked in." },
  STAFF_NOT_AUTHORIZED:     { title: "Not Authorized", message: "You do not have permission to check in guests at this branch." },
  UNAUTHORIZED:             { title: "Session Expired", message: "Your session has expired. Please log in again." },
};

function getErrorDetails(error) {
  const code = error?.response?.data?.code || error?.code;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  const status = error?.response?.status;
  if (status === 401) return ERROR_MESSAGES.UNAUTHORIZED;
  if (status === 403) return ERROR_MESSAGES.STAFF_NOT_AUTHORIZED;
  return {
    title: "Verification Failed",
    message: error?.response?.data?.message || error?.message || "An unexpected error occurred. Please try again.",
  };
}

export default function BranchCheckIn() {
  const { branch } = useBranch();

  // Scanner state
  const [isScanning, setIsScanning]           = useState(false);
  const [isInitializing, setIsInitializing]   = useState(false);
  const [cameraError, setCameraError]         = useState(null);
  const [cameras, setCameras]                 = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("environment");

  // Check-in result state
  const [checkInResult, setCheckInResult]     = useState(null); // { success: true, data: {...} } | { success: false, ...errorDetails }

  // Refs
  const html5QrCodeRef  = useRef(null);
  const isScanningRef   = useRef(false);
  const isProcessingRef = useRef(false);

  // Sync ref
  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current
            .stop()
            .then(() => {
              try { html5QrCodeRef.current?.clear(); } catch (e) {}
            })
            .catch(() => {});
        } else {
          try { html5QrCodeRef.current.clear(); } catch (e) {}
        }
      }
    };
  }, []);

  // Verify check-in mutation
  const verifyMutation = useMutation({
    mutationFn: (token) => verifyBookingCheckIn(token),
    onSuccess: (res) => {
      const data = res?.data?.data;
      setCheckInResult({ success: true, data });
      toast.success("Guest checked in successfully!");
    },
    onError: (error) => {
      const details = getErrorDetails(error);
      setCheckInResult({ success: false, ...details });
      toast.error(details.title);
      // Allow scanning again after a short pause
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2000);
    },
  });

  // Safe scanner stopper
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.warn("Warning: QR scanner stop error:", err);
      }
    }
    setIsScanning(false);
    isScanningRef.current = false;
    setIsInitializing(false);
  }, []);

  // Start scanner
  const startScanner = useCallback(
    async (cameraToUse = selectedCameraId) => {
      // Verify secure context
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.endsWith(".localhost"));

      if (typeof window !== "undefined" && !window.isSecureContext && !isLocal) {
        setCameraError({
          title: "HTTPS Required",
          message: "Camera access requires a secure (HTTPS) connection or localhost.",
        });
        return;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError({
          title: "Camera Not Supported",
          message: "Your browser does not support camera access. Try Chrome, Safari, or Edge.",
        });
        return;
      }

      // Reset states
      setCameraError(null);
      setCheckInResult(null);
      isProcessingRef.current = false;
      setIsInitializing(true);

      // Stop existing instance
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try { await html5QrCodeRef.current.stop(); } catch (e) {}
      }

      // Create instance
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
      }

      // Camera config
      let cameraConfig;
      if (!cameraToUse || cameraToUse === "environment") {
        cameraConfig = { facingMode: "environment" };
      } else if (cameraToUse === "user") {
        cameraConfig = { facingMode: "user" };
      } else {
        cameraConfig = cameraToUse;
      }

      const scanConfig = {
        fps: 12,
        qrbox: (w, h) => {
          const edge = Math.min(w, h);
          const size = Math.max(Math.floor(edge * 0.72), 220);
          return { width: size, height: size };
        },
        aspectRatio: 1.0,
      };

      // On QR scan success → verify with backend
      const onScanSuccess = async (decodedText) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        // Haptic feedback
        if (navigator.vibrate) {
          try { navigator.vibrate([80, 40, 80]); } catch (e) {}
        }

        // Stop scanner, then verify
        await stopScanner();
        verifyMutation.mutate(decodedText);
      };

      const onScanFailure = () => {};

      try {
        try {
          await html5QrCodeRef.current.start(
            cameraConfig,
            scanConfig,
            onScanSuccess,
            onScanFailure
          );
        } catch (startErr) {
          // Fallback: environment → user camera
          if (typeof cameraConfig === "object" && cameraConfig.facingMode === "environment") {
            await html5QrCodeRef.current.start(
              { facingMode: "user" },
              scanConfig,
              onScanSuccess,
              onScanFailure
            );
            setSelectedCameraId("user");
          } else {
            throw startErr;
          }
        }

        setIsScanning(true);
        isScanningRef.current = true;
        setIsInitializing(false);

        // Enumerate cameras after permission granted
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices?.length > 0) setCameras(devices);
        } catch (e) {}
      } catch (err) {
        setIsInitializing(false);
        setIsScanning(false);
        isScanningRef.current = false;

        const name = err?.name || "";
        const msg  = err?.message || String(err);

        if (name === "NotAllowedError" || msg.includes("Permission denied")) {
          setCameraError({
            title: "Camera Permission Denied",
            message: "Click the camera icon in your browser's address bar to allow camera access.",
          });
        } else if (name === "NotFoundError" || msg.includes("NotFound")) {
          setCameraError({
            title: "No Camera Found",
            message: "No webcam or camera was detected on this device.",
          });
        } else if (name === "NotReadableError" || msg.includes("in use")) {
          setCameraError({
            title: "Camera Already In Use",
            message: "The camera is being used by another application. Close it and try again.",
          });
        } else {
          setCameraError({
            title: "Scanner Error",
            message: msg || "Failed to start camera. Please refresh and try again.",
          });
        }
      }
    },
    [selectedCameraId, stopScanner, verifyMutation]
  );

  const handleCameraChange = async (newId) => {
    setSelectedCameraId(newId);
    if (isScanning) {
      await stopScanner();
      setTimeout(() => startScanner(newId), 250);
    }
  };

  const handleScanAgain = () => {
    setCheckInResult(null);
    setCameraError(null);
    isProcessingRef.current = false;
    startScanner();
  };

  const isVerifying = verifyMutation.isPending;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-12 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <QrCode className="h-6 w-6 text-primary" />
          Guest Check-in
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Scan a customer's booking QR code to check them in.
          {branch?.name && (
            <span className="ml-1 font-semibold text-slate-700">{branch.name}</span>
          )}
        </p>
      </div>

      {/* Camera selection */}
      {cameras.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Camera</span>
          <Select value={selectedCameraId} onValueChange={handleCameraChange}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200">
              <SelectValue placeholder="Select camera" />
            </SelectTrigger>
            <SelectContent>
              {cameras.map((cam) => (
                <SelectItem key={cam.id} value={cam.id} className="text-xs">
                  {cam.label || `Camera ${cam.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Scanner viewport */}
      <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-xl min-h-[300px] flex items-center justify-center">
        {/* html5-qrcode renders into this div */}
        <div
          id={SCANNER_ELEMENT_ID}
          className="w-full"
          style={{ minHeight: isScanning || isInitializing ? "300px" : "0px" }}
        />

        {/* Overlay when idle */}
        {!isScanning && !isInitializing && !checkInResult && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <QrCode className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-bold text-sm">Camera Inactive</p>
              <p className="text-slate-400 text-xs">Click Start Scanner to activate the camera</p>
            </div>
          </div>
        )}

        {/* Initializing overlay */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-white text-xs font-medium">Requesting camera access…</p>
            </div>
          </div>
        )}

        {/* Verifying overlay */}
        {isVerifying && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-white text-xs font-medium">Verifying booking…</p>
            </div>
          </div>
        )}

        {/* Scanning status badge */}
        {isScanning && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] font-bold flex items-center gap-1.5 px-3 py-1 shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Scanning…
            </Badge>
          </div>
        )}
      </div>

      {/* Scanner controls */}
      <div className="flex gap-3">
        {!isScanning ? (
          <Button
            className="flex-1 bg-primary hover:bg-primary/95 text-white rounded-xl gap-2 font-bold shadow-md shadow-primary/20"
            onClick={() => startScanner()}
            disabled={isInitializing || isVerifying}
          >
            {isInitializing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {isInitializing ? "Starting…" : "Start Scanner"}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1 rounded-xl gap-2 border-slate-200 font-bold"
            onClick={stopScanner}
          >
            <CameraOff className="h-4 w-4" />
            Stop Scanner
          </Button>
        )}
      </div>

      {/* Camera error */}
      {cameraError && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-extrabold text-sm">{cameraError.title}</AlertTitle>
          <AlertDescription className="text-xs mt-1">{cameraError.message}</AlertDescription>
        </Alert>
      )}

      {/* Check-in success result */}
      {checkInResult?.success && (
        <div className="bg-white border border-emerald-200 rounded-3xl p-5 space-y-4 shadow-sm">
          {/* Success header */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-extrabold text-emerald-700 text-sm">Check-in Successful!</p>
              <p className="text-xs text-slate-500">Guest has been checked in.</p>
            </div>
            <Badge className="ml-auto bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[10px]">
              Checked In
            </Badge>
          </div>

          {/* Guest & booking details */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs">
            {checkInResult.data?.customerName && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Customer
                </span>
                <span className="font-bold text-slate-800">{checkInResult.data.customerName}</span>
              </div>
            )}
            {checkInResult.data?.restaurantName && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Restaurant</span>
                <span className="font-bold text-slate-700">{checkInResult.data.restaurantName}</span>
              </div>
            )}
            {checkInResult.data?.branchName && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Branch</span>
                <span className="font-bold text-slate-700">{checkInResult.data.branchName}</span>
              </div>
            )}
            {checkInResult.data?.date && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Date
                </span>
                <span className="font-bold text-slate-700">{checkInResult.data.date}</span>
              </div>
            )}
            {checkInResult.data?.time && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Time
                </span>
                <span className="font-bold text-slate-700">{checkInResult.data.time}</span>
              </div>
            )}
            {checkInResult.data?.guests && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Users className="h-3 w-3" /> Guests
                </span>
                <span className="font-bold text-slate-700">{checkInResult.data.guests}</span>
              </div>
            )}
            {checkInResult.data?.tableNames && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Table
                </span>
                <span className="font-bold text-slate-700">{checkInResult.data.tableNames}</span>
              </div>
            )}
            {checkInResult.data?.checkedInAt && (
              <div className="flex justify-between pt-1.5 border-t border-slate-200">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Checked in at
                </span>
                <span className="font-bold text-emerald-600">
                  {new Date(checkInResult.data.checkedInAt).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {/* Scan next guest */}
          <Button
            className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl gap-2 font-bold"
            onClick={handleScanAgain}
          >
            <RotateCcw className="h-4 w-4" />
            Scan Next Guest
          </Button>
        </div>
      )}

      {/* Check-in failure result */}
      {checkInResult && !checkInResult.success && (
        <div className="bg-white border border-red-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="font-extrabold text-red-700 text-sm">{checkInResult.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{checkInResult.message}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-xl gap-2 border-slate-200 font-bold"
            onClick={handleScanAgain}
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Informational tip when scanning */}
      {isScanning && !checkInResult && (
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-3">
          <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500">
            Hold the QR code steady inside the frame. The scanner will verify the booking automatically.
          </p>
        </div>
      )}
    </div>
  );
}
