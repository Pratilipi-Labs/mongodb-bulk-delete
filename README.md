# mongodb-bulk-delete

  

A configurable tool to delete records in bulk while in control. 

## Usage  

``` js

const  bulkDelete  =  require('mongodb-bulk-delete');

bulkDelete.configure({
	uri: 'mongodb://localhost:27017',
	db: 'test',
	collection: 'user',
	query: { userId: { $gt: 100 } },
	removalBatchSize: 100
});  

bulkDelete.initialise();  
```

The following options are configurable:

| Name          | Default                     |  Description    |
| ------------- | --------------------------- | --------------- |
| `uri`			| `'mongodb://localhost:27017'` | Standard [mongodb connection uri]([https://docs.mongodb.com/manual/reference/connection-string/](https://docs.mongodb.com/manual/reference/connection-string/))|  
| `db`|| Database name|
| `collection` || Collection name|
| `query`  || query object|
| `removalBatchSize` | `1000`                      | Number of documents deleted in a batch|
-------------------------------------------------------
