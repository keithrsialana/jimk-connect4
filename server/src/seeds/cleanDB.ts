import process from 'process';

const cleanDB = async (): Promise<void> => {
  try {
    // TODO: fill if needed
    console.log("Hello World")

  } catch (err) {
    console.error('Error cleaning collections:', err);
    process.exit(1);
  }
};

export default cleanDB;
