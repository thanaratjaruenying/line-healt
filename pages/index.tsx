import DropBox from "./DropBox";

const Home = () => {
  return (
    <div className="md:container md:mx-auto flex justify-center fixed top-2/4 left-2/4 -translate-y-1/2 -translate-x-1/2">
      <div className="flex flex-col w-1/2">
        <h1>Websites Checker</h1>
        <DropBox />
      </div>
    </div>
  );
};

export default Home;
