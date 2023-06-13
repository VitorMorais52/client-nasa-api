/* eslint-disable @next/next/no-img-element */
import { GetServerSideProps } from "next";
interface IDataProps {
  copyright: string;
  date: string;
  explanation: string;
  hdurl: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
}

interface IApodProps {
  data: IDataProps;
}

export default function apod({ data }: IApodProps) {
  const { title, explanation, date, copyright } = data;
  return (
    <div className="flex bg-black w-full h-screen text-gray-300">
      <img
        src={data.hdurl}
        alt="apod image by nasa"
        className="max-w-2/4 h-screen"
      />
      <div className="flex flex-col max-w-4xl mx-8">
        <span className="text-5xl mb-4">{title}</span>
        <span className="text-3xl mb-1">{explanation}</span>
        <span className="text-2xl ml-auto">
          by {copyright}, {date}
        </span>
        <span className="text-2xl mb-4 ml-auto"></span>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await fetch(
    `https://api.nasa.gov/planetary/apod?concept_tags=true&api_key=${process.env.APOD_API_KEY}`
  );
  const data = await response.json();

  return {
    props: { data },
  };
};
