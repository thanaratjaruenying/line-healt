import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import dayjs from "dayjs";

import axios from "../../lib/axios";
import ProgressBar from "../../components/progresBar";


const csv = <Image src="/csv.png" alt="me" width="64" height="64" />;

interface HealthUrlResult {
  status: boolean;
  url: string;
}

interface HealthOverAll {
  up: number;
  down: number;
}

export default function DropBox() {
  const [startTime, setStartTime] = useState<dayjs.Dayjs>();
  const [endTime, setEndTime] = useState<dayjs.Dayjs>();
  const [percent, setPercent] = useState<number>(0);
  const [file, setFile] = useState<File | undefined>();
  const [healthResult, setHealthResult] = useState<
    ReadonlyArray<HealthUrlResult>
  >([]);
  const [healthOverall, setHealthOverall] = useState<HealthOverAll>({
    up: 0,
    down: 0,
  });
  const onDrop = useCallback(async (acceptedFiles: any) => {
    setStartTime(dayjs());
    setFile(acceptedFiles[0]);
    const formData = new FormData();
    formData.append("file", acceptedFiles[0], acceptedFiles[0].name);

    try {
      const response = await axios.post("upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setPercent(percentCompleted);
        },
      });

      setEndTime(dayjs());
      setHealthResult(response.data);
    } catch (error) {
      alert("Somthing went wrong, please try again later");
    }
  }, []);

  const executeTime = () => {
    const second = endTime?.diff(startTime, "second") || 0;
    if (second <= 0) {
      return "Used less than 1 second";
    }
    const min = endTime?.diff(startTime, "minute") || 0;
    if (min > 0) {
      return `Used ${min} minutes and ${second} seconds`;
    } else {
      return `Used ${second} seconds`;
    }
  };

  useEffect(() => {
    const cal = healthResult.reduce(
      (acc: HealthOverAll, curr: HealthUrlResult) => {
        if (curr.status) {
          acc.up += 1;

          return acc;
        } else {
          acc.down += 1;

          return acc;
        }
      },
      { up: 0, down: 0 }
    );

    setHealthOverall(cal);
    setFile(undefined);
  }, [healthResult]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDragEnter: () => {
      setHealthResult([]);
    },
    onFileDialogOpen: () => {
      setHealthResult([]);
    },
    noClick: true,
    maxSize: 1024 * 1024 * 10,
    maxFiles: 1,
    accept: {
      "text/csv": [".csv"],
    },
  });

  return (
    <>
      <div
        {...getRootProps()}
        className="flex flex-col items-center p-10 bg-slate-50 border-dashed border-2 border-slate-300 rounded-md"
      >
        {csv}
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag your .csv file here to start uploading</p>
        )}
        <p>OR</p>
        <button
          className="bg-sky-500 p-2 rounded-md text-white"
          type="button"
          onClick={open}
        >
          Browse File
        </button>
      </div>
      {file ? (
        <div className="flex flex-row p-5 w-full">
          <div>{csv}</div>
          <div className="w-full flex flex-col justify-evenly">
            <div className="flex flex-row justify-between w-full">
              <p>{file.name}</p>
              <p>{percent}%</p>
            </div>
            <ProgressBar progressPercentage={percent} />
          </div>
        </div>
      ) : undefined}
      {healthResult.length ? (
        <div className="p-10 bg-white border-2 rounded-md mt-10 shadow-md">
          <p>Total {healthResult.length} Websites</p>
          <p>({executeTime()})</p>
          <div className="flex flex-row justify-around rounded-md mt-5">
            <div className="bg-green-500 p-4 rounded-md text-white	">
              <span className="text-xs">UP</span>
              <p className="text-xl">{healthOverall.up}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-md">
              <span className="text-xs">DOWN</span>
              <p className="text-xl">{healthOverall.down}</p>
            </div>
          </div>
        </div>
      ) : undefined}
    </>
  );
}
