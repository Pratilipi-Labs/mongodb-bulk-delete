const assert = require('assert');
const readline = require('readline');

const MongoClient = require('mongodb').MongoClient;

let config = {
  uri: 'mongodb://localhost:27017',
  removalBatchSize: 1000
}

const configure = (configs) => {
  assert.equal(typeof configs.uri, 'string', 'mongodb uri missing or in wrong format');
  assert.equal(typeof configs.db, 'string', 'db name missing or in wrong format');
  assert.equal(typeof configs.collection, 'string', 'collection name missing or in wrong format');
  assert.equal(typeof configs.removalBatchSize, 'number', 'removal batch size missing or in wrong format');
  assert.equal(typeof configs.query, 'object', 'query missing or in wrong format');

  config = { ...configs };
}

const getBatch = (db) => new Promise((resolve, reject) => {
  const collection = db.collection(config.collection);
  collection
    .find(config.query)
    .project({_id: 1})
    .limit(config.removalBatchSize)
    .toArray((err, docs) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(docs.map(doc => doc._id));
    });
})

const deleteBatch = (db, batch) => new Promise((resolve, reject) => {
  const collection = db.collection(config.collection);
  collection
    .deleteMany({ _id: { $in: batch } }, (err, reply) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(reply);
    })
})

const getClient = () => new Promise((resolve, reject) => {
  MongoClient.connect(config.uri, { useUnifiedTopology: true }, function(err, client) {
    console.log("Connected successfully to server\n");
    if (err) {
      resolve(err);
      return;
    }
    resolve(client);
  });
})

const getTotalDocuments = (db) => new Promise((resolve, reject) => {
  const collection = db.collection(config.collection);
  collection
    .countDocuments(config.query, (err, docs) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(docs);
    })
})

const getStatus = (total, batchNumber) => ((batchNumber * config.removalBatchSize * 100) / total).toFixed(2);

const printProgress = (message) => {
  readline.clearLine(process.stdout);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(message);
}

const convertMS = (milliseconds) => {
  let hour;
  let minute;
  let seconds;
  seconds = Math.floor(milliseconds / 1000);
  minute = Math.floor(seconds / 60);
  seconds = seconds % 60;
  hour = Math.floor(minute / 60);
  minute = minute % 60;
  hour = hour % 24;

  let message = '';
  if (hour > 0) message += `${hour}h `
  if (minute > 0) message += `${minute}m `
  if (seconds > 0) message += `${seconds}s`
  return message;
}

const initialise = async () => {
  try {
    const client = await getClient();
    const db = client.db(config.db);

    console.log('Getting total documents...');
    const total = await getTotalDocuments(db);
    console.log(`Total Documents matching query: ${total}\n`);

    let batchNumber = 1;
    let documentsDeleted = 0;
    const startTime = Date.now();
    while(true) {
      const batch = await getBatch(db);
      await deleteBatch(db, batch);
      documentsDeleted += batch.length;
      printProgress(`Documents Deleted: ${documentsDeleted} \t Progress: ${Math.min(getStatus(total, batchNumber++), 100)}%`);
      if (batch.length < config.removalBatchSize) break;
    }
    console.log('\n');

    console.log('Successfully completed!');
    client.close();

    return {
      documentsDeleted,
      timeTaken: convertMS(Date.now() - startTime)
    }

  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  initialise,
  configure
};
