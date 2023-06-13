import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

interface ICloseApproachData {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  miss_distance: Record<
    "astronomical" | "kilometers" | "lunar" | "miles",
    string
  >;
  orbiting_body: string;
  relative_velocity: Record<
    "kilometers_per_hour" | "kilometers_per_second" | "miles_per_hour",
    string
  >;
}

interface IEstimated_diameter {
  feet: Record<"estimated_diameter_max" | "estimated_diameter_min", number>;
  kilometers: Record<
    "estimated_diameter_max" | "estimated_diameter_min",
    number
  >;
  meters: Record<"estimated_diameter_max" | "estimated_diameter_min", number>;
  miles: Record<"estimated_diameter_max" | "estimated_diameter_min", number>;
}

interface IAsteroidProps {
  absolute_magnitude_h: number;
  close_approach_data: ICloseApproachData[];
  estimated_diameter: IEstimated_diameter;
  id: string;
  is_potentially_hazardous_asteroid: boolean;
  is_sentry_object: boolean;
  links: Record<"self", string>;
  name: string;
  nasa_jpl_url: string;
  neo_reference_id: string;
}
interface IDataProps {
  element_count: number;
  links: Record<"next" | "previous" | "self", string>;
  neo: Record<string, IAsteroidProps[]>;
}

interface INeoWsProps {
  data: IDataProps;
}

export default function Neows({ data }: INeoWsProps) {
  const [apiData, setApiData] = useState(data);

  const [currentAsteroid, setCurrentAsteroid] = useState([]);
  const [sortedDates, setSortedDates] = useState([]);

  useEffect(() => {
    if (!apiData) return;

    const sortedDates = Object.keys(apiData.neo).sort(function (a, b) {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    setSortedDates(sortedDates);
    setCurrentAsteroid(apiData.neo[sortedDates[0]]);
  }, [apiData]);

  const renderAsteroidInfo = (asteroid: IAsteroidProps, isNexted = false) => {
    return (
      <div
        style={{
          marginBottom: isNexted ? "1rem" : "5rem",
          marginLeft: isNexted ? "1rem" : "0",
        }}
      >
        {Object.entries(asteroid).map(([name, value]) => (
          <div
            key={isNexted ? name : asteroid.id + "-" + name}
            className={
              ["string", "number", "boolean"].includes(typeof value)
                ? "flex"
                : ""
            }
          >
            <div id="title" className="flex mr-1 font-bold">
              {name}:
            </div>
            {["string", "number", "boolean"].includes(typeof value) ? (
              <div id="value">{value.toString()}</div>
            ) : (
              renderAsteroidInfo(value, true)
            )}
          </div>
        ))}
      </div>
    );
  };

  const getNewAsteroidList = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();
    setApiData({ ...data, neo: data.near_earth_objects });
  };

  return (
    <div className="flex bg-black w-full min-h-screen h-full text-gray-300">
      <div className="m-auto">
        <div id="head" className="flex">
          <button
            type="button"
            onClick={() => getNewAsteroidList(apiData.links.previous)}
          >
            previous
          </button>
          {sortedDates.map((date) => (
            <div key={date} className="mx-8 text-3xl">
              <button
                type="button"
                onClick={() => setCurrentAsteroid(apiData.neo[date])}
              >
                {date}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => getNewAsteroidList(apiData.links.next)}
          >
            next
          </button>
        </div>
        <div id="body" className="mx-8 mt-4 bg-gray-800">
          {currentAsteroid.map((asteroid) => (
            <div key={asteroid.id}>{renderAsteroidInfo(asteroid)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const dateNow = new Date();
  const dateAfterSeven = new Date();

  dateNow.setDate(dateNow.getDate());
  dateAfterSeven.setDate(dateAfterSeven.getDate() + 7);

  const [startDate, endDate] = [dateNow, dateAfterSeven].map((date) => {
    // YYYY-MM-DD
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  });

  const response = await fetch(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${process.env.APOD_API_KEY}`
  );
  const data = await response.json();
  return {
    props: { data: { ...data, neo: data.near_earth_objects } },
  };
};
