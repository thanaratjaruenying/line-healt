const ProgressBar = ({
  progressPercentage,
}: {
  progressPercentage: number;
}) => {
  return (
    <div className="h-1 w-full bg-gray-300 w-full">
      <div
        style={{ width: `${progressPercentage}%` }}
        className={`h-full ${
          progressPercentage < 70 ? "bg-sky-500/50" : "bg-sky-500"}`}
      ></div>
    </div>
  );
};

export default ProgressBar;
