const MongoClient = require('mongodb').MongoClient;

let config = {
  uri: 'mongodb://localhost:27017',
  removalBatchSize: 1000
}

const configure = (configs) => {
  console.log(config);
  config = { ...configs };
  console.log(config);
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
    console.log("Connected successfully to server");
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


const initialise = async () => {
  try {
    const client = await getClient();
    const db = client.db(config.db);

    console.log('Getting total documents...');
    const total = await getTotalDocuments(db);
    console.log(`Total Documents matching query: ${total}`);
    let batchNumber = 1;

    while(true) {
      const batch = await getBatch(db);
      await deleteBatch(db, batch);
      console.log(`${Math.min(getStatus(total, batchNumber++), 100)}% completed`);
      if (batch.length < config.removalBatchSize) break;
    }

    console.log('Successfully completed!')
    client.close();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = {
  initialise,
  configure
};
