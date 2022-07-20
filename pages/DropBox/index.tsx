import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import dayjs from "dayjs";

import ProgressBar from "../../components/progresBar";
import config from "../../config";

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
  const [endTime, setEndTime] = useState<dayjs.Dayjs>()
  const [percent, setPercent] = useState<number>(0)
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

    let request = new XMLHttpRequest();
    request.open("POST", `${config.serverUrl}/upload`);

    // upload progress event
    request.upload.addEventListener("progress", function (e) {
      // upload progress as percentage
      let percentCompleted = (e.loaded / e.total) * 100;
      setPercent(percentCompleted);
    });

    // request finished event
    request.addEventListener("load", function (e) {
      setEndTime(dayjs());

      setHealthResult(JSON.parse(request.response));
    });

    // send POST request to server
    request.send(formData);
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
    noClick: true,
    maxSize: 1024 * 1024 * 10,
    maxFiles: 1,
    accept: {
      "text/csv": [".csv"],
    },
  });

  return (
    <div {...getRootProps()}>
      {csv}
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here ...</p>
      ) : (
        <p>Drag your .csv file here to start uploading</p>
      )}
      <p>OR</p>
      <button type="button" onClick={open}>
        Browse File
      </button>
      {file ? (
        <div>
          {csv}
          <p>{file.name}</p>
          <ProgressBar progressPercentage={percent} />
        </div>
      ) : undefined}
      {healthResult.length ? (
        <div>
          <p>Total {healthResult.length} Websites</p>
          <p>({executeTime()})</p>
          <div>
            <div>
              <span>UP</span>
              <p>{healthOverall.up}</p>
            </div>
            <div>
              <span>DOWN</span>
              <p>{healthOverall.down}</p>
            </div>
          </div>
        </div>
      ) : undefined}
    </div>
  );
}
