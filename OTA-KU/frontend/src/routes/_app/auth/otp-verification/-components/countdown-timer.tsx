import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiresAt: string;
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const expireDate = new Date(expiresAt);

      // If expired, show 00:00
      if (now > expireDate) {
        setTimeRemaining("00:00");
        return;
      }

      // Calculate time difference in seconds
      const diffInSeconds = Math.floor(
        (expireDate.getTime() - now.getTime()) / 1000,
      );

      // Format as MM:SS
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;

      const formattedMinutes = String(minutes).padStart(2, "0");
      const formattedSeconds = String(seconds).padStart(2, "0");

      setTimeRemaining(`${formattedMinutes}:${formattedSeconds}`);
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const intervalId = setInterval(calculateTimeRemaining, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [expiresAt]);

  return (
    <span className="font-medium">Kode berlaku selama: {timeRemaining}</span>
  );
}
