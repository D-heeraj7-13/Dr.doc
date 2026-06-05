import PouchDB from "pouchdb-browser";

export const localDB = new PouchDB("weatherdb");

export const remoteDB = new PouchDB(
  "http://admin:admin@localhost:5984/weatherdb"
);

localDB
  .sync(remoteDB, {
    live: true,
    retry: true,
  })
  .on("change", (info) => {
    console.log("SYNC CHANGE", info);
  })
  .on("paused", () => {
    console.log("SYNC PAUSED");
  })
  .on("active", () => {
    console.log("SYNC ACTIVE");
  })
  .on("error", (err) => {
    console.error("SYNC ERROR", err);
  });

export default localDB;