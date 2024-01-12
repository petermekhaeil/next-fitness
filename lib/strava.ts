export interface StravaActivity {
  id: number;
  start_date: string;
  distance: number;
  elapsed_time: number;
  moving_time: number;
  average_speed: number;
  average_heartrate: number;
  type: string;
  name: string;
  splits_metric: [
    {
      distance: number;
      elapsed_time: number;
      elevation_difference: number;
      moving_time: number;
      split: number;
      average_speed: number;
      pace_zone: number;
    }
  ];
}
