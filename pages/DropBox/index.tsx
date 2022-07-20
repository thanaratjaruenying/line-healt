import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

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
  const [file, setFile] = useState<File | undefined>();
  const [healthResult, setHealthResult] = useState<
    ReadonlyArray<HealthUrlResult>
  >([]);
  const [healthOverall, setHealthOverall] = useState<HealthOverAll>({
    up: 0,
    down: 0,
  });
  const onDrop = useCallback(async (acceptedFiles: any) => {
    setFile(acceptedFiles[0]);
    const formData = new FormData();
    formData.append("file", acceptedFiles[0], acceptedFiles[0].name);

    const response = await fetch(`${config.serverUrl}/upload`, {
      method: "POST",
      body: formData,
      redirect: "follow",
    });
    const result = await response.json();
    setHealthResult(result);
  }, []);

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
        </div>
      ) : undefined}
      {healthResult.length ? (
        <div>
          <p>Total {healthResult.length} Websites</p>
          <p>(Used)</p>
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
