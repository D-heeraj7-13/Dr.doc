import PouchDB from "pouchdb-browser";

export const localDB = new PouchDB("weatherdb");

export const remoteDB = new PouchDB(
  "http://admin:admin@localhost:5984/weatherdb"
);

localDB.sync(remoteDB, {
  live: true,
  retry: true,
});

export default localDB;