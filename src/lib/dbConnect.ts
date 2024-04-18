import mongoose from "mongoose";

// here we use typescript also to get the return object of connect
// what types or datat types we get in db object
type connectionObjectType = {
  isConnected?: number; // optional or always a number
};

// connection variable object which can be empty due to type of isConnected ?
const connection: connectionObjectType = {};

async function myDbConnection(): Promise<void> {
  // datatype of void , we dont care which datatype will be return but it return promise
  if (connection.isConnected) {
    console.log("DB already connected!");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO_DB_URI || "", {});
    //console.log("db: ", db); // check what is inside of db
    connection.isConnected = db.connections[0].readyState; // readyState provide us a number
    //console.log("db.connections: ", db.connections[0]);

    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error in Db conneciton: ", error);
    process.exit(1);
  }
}

export default myDbConnection;
