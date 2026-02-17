import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import BreathingActivity from "../therapies/BreathingActivity";
import MeditationActivity from "../therapies/MeditationActivity";
import BodyScanActivity from "../therapies/BodyScanActivity";
import GroundingActivity from "../therapies/GroundingActivity";
import FocusGame from "../therapies/FocusGame";
import MemoryGame from "../therapies/MemoryGame";

type Activity = {
  id: number;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  category: string;
  type: string;
  ui: string;
};

export default function ActivityPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const activity: Activity | undefined = location.state?.activity;

  useEffect(() => {
    if (!activity) navigate("/activities");
  }, [activity, navigate]);

  if (!activity) return null;

  switch (activity.type) {
    case "breathing":
      return <BreathingActivity activity={activity} />;

    case "meditation":
      return <MeditationActivity activity={activity} />;

    case "bodyscan":
      return <BodyScanActivity activity={activity} />;

    case "grounding":
      return <GroundingActivity activity={activity} />;

    case "game-focus":
      return <FocusGame activity={activity} />;

    case "game-memory":
      return <MemoryGame activity={activity} />;

    default:
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          Unknown activity
        </div>
      );
  }
}


