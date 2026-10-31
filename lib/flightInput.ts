// Manual rocket flight: the on-screen buttons write here, the scene reads it every frame.
const input = { thrust: false, left: false, right: false, brake: false, horn: false };
let altitude = 0;

export type FlightKey = keyof typeof input;
export const setFlightInput = (key: FlightKey, value: boolean) => {
  input[key] = value;
};
export const getFlightInput = () => input;
export const setAltitude = (value: number) => {
  altitude = value;
};
export const getAltitude = () => altitude;
